using System.Text.Json;
using backend.Common.Attributes;
using backend.Common.Providers;
using backend.Config;
using backend.DTOs.Auth;
using backend.DTOs.User;
using backend.Mappers;
using backend.Services.UserService;
using FirebaseAdmin;
using FirebaseAdmin.Auth;
using FluentResults;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Util;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace backend.Services.AuthService;

[ScopedService]
public class AuthService(
    MongoDbContext context,
    UserMapper userMapper,
    IUserService userService,
    IOptions<FirebaseSettings> firebaseSettings,
    FirebaseAuthProvider firebaseAuthProvider,
    ILogger<AuthService> logger,
    IHttpClientFactory httpClientFactory
) : IAuthService
{
    private readonly MongoDbContext _context = context;
    private readonly UserMapper _userMapper = userMapper;
    private readonly IUserService _userService = userService;
    private readonly ILogger<AuthService> _logger = logger;
    private readonly IOptions<FirebaseSettings> _firebaseSettings = firebaseSettings;

    private readonly FirebaseAuth _firebaseAuth = firebaseAuthProvider.Auth;
    private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;

    private const string SignInUrlBase =
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=";

    public async Task<Result<AuthResponseDto>> LoginAsync(LoginDto loginDto)
    {
        try
        {
            var firebaseAuthResult = await AuthenticateWithFirebaseAsync(loginDto);

            if (firebaseAuthResult.IsFailed)
            {
                return Result
                    .Fail<AuthResponseDto>("Email or password is incorrect.")
                    .WithErrors(firebaseAuthResult.Errors);
            }

            var firebaseResult = firebaseAuthResult.Value;

            var userResult = await GetLocalUserAsync(firebaseResult.Email);

            if (userResult.IsFailed)
            {
                return Result
                    .Fail<AuthResponseDto>("Error retrieving local user.")
                    .WithErrors(userResult.Errors);
            }

            var user = userResult.Value;

            var responseDto = new AuthResponseDto { Token = firebaseResult.IdToken, User = user };

            return Result.Ok(responseDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login failed.");
            return Result.Fail<AuthResponseDto>("Login failed.").WithError(ex.Message);
        }
    }

    public async Task<Result<AuthResponseDto>> RegisterAsync(RegisterDto registerDto)
    {
        try
        {
            // Check if user already exists in MongoDB
            var existingUser = await _context
                .Users.Find(u =>
                    u.Email.Equals(registerDto.Email, StringComparison.CurrentCultureIgnoreCase)
                    || u.Username.Equals(
                        registerDto.Username,
                        StringComparison.CurrentCultureIgnoreCase
                    )
                )
                .FirstOrDefaultAsync();

            if (existingUser != null)
            {
                return Result.Fail<AuthResponseDto>(
                    existingUser.Email == registerDto.Email
                        ? "Email is already in use."
                        : "Username is already in use."
                );
            }

            // Create user in Firebase Authentication
            var userRecordArgs = new UserRecordArgs
            {
                Email = registerDto.Email,
                Password = registerDto.Password,
                DisplayName = registerDto.DisplayName ?? registerDto.Username,
            };

            UserRecord firebaseUser = await _firebaseAuth.CreateUserAsync(userRecordArgs);

            if (firebaseUser == null)
            {
                return Result.Fail<AuthResponseDto>("Failed to create user in Firebase.");
            }

            // Create user in MongoDB
            var newUser = _userMapper.ToUser(
                new CreateUserDto
                {
                    Username = registerDto.Username,
                    Email = registerDto.Email,
                    DisplayName = registerDto.DisplayName,
                }
            );

            await _context.Users.InsertOneAsync(newUser);

            // Generate token for the new user
            var token = await AuthenticateWithFirebaseAsync(
                new LoginDto { Email = registerDto.Email, Password = registerDto.Password }
            );

            if (token.IsFailed)
            {
                return Result
                    .Fail<AuthResponseDto>("Registration failed.")
                    .WithErrors(token.Errors);
            }

            var response = new AuthResponseDto
            {
                Token = token.Value.IdToken,
                User = _userMapper.ToDto(newUser),
            };

            return Result.Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Registration failed.");
            return Result.Fail<AuthResponseDto>("Registration failed.").WithError(ex.Message);
        }
    }

    public async Task<Result<string>> VerifyTokenAsync(string token)
    {
        try
        {
            var decodedToken = await _firebaseAuth.VerifyIdTokenAsync(token);
            var uid = decodedToken.Uid;

            // Get Firebase user
            var firebaseUser = await _firebaseAuth.GetUserAsync(uid).ThrowIfNull("Invalid token.");

            // Find corresponding user in MongoDB
            var user = await _context
                .Users.Find(u => u.Email == firebaseUser.Email)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return Result.Fail<string>("User not found.");
            }

            return Result.Ok(user.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Token verification failed.");
            return Result.Fail<string>("Token verification failed.").WithError(ex.Message);
        }
    }

    private async Task<Result<FirebaseRestResponse>> AuthenticateWithFirebaseAsync(
        LoginDto loginDto
    )
    {
        try
        {
            var firebaseApiKey = _firebaseSettings.Value.ApiKey;
            var fullUrl = SignInUrlBase + firebaseApiKey;

            using var client = _httpClientFactory.CreateClient();

            var requestBody = new
            {
                email = loginDto.Email,
                password = loginDto.Password,
                returnSecureToken = true,
            };

            var response = await client.PostAsJsonAsync(fullUrl, requestBody);

            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return Result.Fail<FirebaseRestResponse>("Authentication with Firebase failed.");
            }

            var firebaseResult = JsonSerializer.Deserialize<FirebaseRestResponse>(json);

            if (firebaseResult == null || string.IsNullOrEmpty(firebaseResult.IdToken))
            {
                return Result.Fail<FirebaseRestResponse>("Invalid response from Firebase.");
            }

            return Result.Ok(firebaseResult);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Authentication with Firebase failed.");
            return Result
                .Fail<FirebaseRestResponse>("Authentication with Firebase failed.")
                .WithError(ex.Message);
        }
    }

    private async Task<Result<UserResponseDto>> GetLocalUserAsync(string email)
    {
        var user = await _context.Users.Find(u => u.Email == email).FirstOrDefaultAsync();

        if (user == null)
        {
            return Result.Fail<UserResponseDto>("User not found in local database.");
        }

        return Result.Ok(_userMapper.ToDto(user));
    }
}
