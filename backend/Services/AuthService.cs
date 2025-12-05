using backend.Common.Attributes;
using backend.Config;
using backend.DTOs.Auth;
using backend.DTOs.User;
using backend.Mappers;
using backend.Models;
using backend.Services.Interfaces;
using backend.Services.UserService;
using FirebaseAdmin;
using FirebaseAdmin.Auth;
using FluentResults;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace backend.Services;

[ScopedService]
public class AuthService : IAuthService
{
    private readonly MongoDbContext _context;
    private readonly UserMapper _mapper;
    private readonly IUserService _userService;
    private readonly FirebaseAuth _firebaseAuth;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        MongoDbContext context,
        UserMapper mapper,
        IUserService userService,
        IOptions<FirebaseSettings> firebaseSettings,
        ILogger<AuthService> logger
    )
    {
        _context = context;
        _mapper = mapper;
        _userService = userService;
        _logger = logger;

        // Initialize Firebase Admin SDK if not already initialized
        if (FirebaseApp.DefaultInstance == null)
        {
            var serviceAccountJson = firebaseSettings.Value.ServiceAccountJson;
            FirebaseApp.Create(new AppOptions
            {
                Credential = GoogleCredential.FromJson(serviceAccountJson)
            });
        }

        _firebaseAuth = FirebaseAuth.DefaultInstance;
    }

    public async Task<Result<AuthResponseDto>> RegisterAsync(RegisterDto registerDto)
    {
        try
        {
            // Check if user already exists in MongoDB
            var existingUser = await _context
                .Users.Find(u => u.Email == registerDto.Email || u.Username == registerDto.Username)
                .FirstOrDefaultAsync();

            if (existingUser != null)
            {
                return Result.Fail<AuthResponseDto>(
                    existingUser.Email == registerDto.Email
                        ? "Email is already in use."
                        : "Username is already in use."
                );
            }

            // Create user in Firebase Auth
            var userRecordArgs = new UserRecordArgs
            {
                Email = registerDto.Email,
                Password = registerDto.Password,
                EmailVerified = false,
                DisplayName = registerDto.DisplayName ?? registerDto.Username
            };

            UserRecord firebaseUser;
            try
            {
                firebaseUser = await _firebaseAuth.CreateUserAsync(userRecordArgs);
            }
            catch (FirebaseAuthException ex)
            {
                _logger.LogError(ex, "Firebase user creation failed");
                return Result.Fail<AuthResponseDto>($"Failed to create user: {ex.Message}");
            }

            // Create user in MongoDB
            var newUser = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                DisplayName = registerDto.DisplayName ?? registerDto.Username,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.Users.InsertOneAsync(newUser);

            // Generate custom token
            var token = await _firebaseAuth.CreateCustomTokenAsync(firebaseUser.Uid);

            var response = new AuthResponseDto
            {
                Token = token,
                User = _mapper.ToDto(newUser)
            };

            return Result.Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Registration failed");
            return Result.Fail<AuthResponseDto>($"Registration failed: {ex.Message}");
        }
    }

    public async Task<Result<AuthResponseDto>> LoginAsync(LoginDto loginDto)
    {
        try
        {
            // Find user in MongoDB
            var user = await _context
                .Users.Find(u => u.Email.ToLower() == loginDto.Email.ToLower())
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return Result.Fail<AuthResponseDto>("Invalid email or password.");
            }

            // Get Firebase user by email
            UserRecord firebaseUser;
            try
            {
                firebaseUser = await _firebaseAuth.GetUserByEmailAsync(loginDto.Email);
            }
            catch (FirebaseAuthException)
            {
                return Result.Fail<AuthResponseDto>("Invalid email or password.");
            }

            // Note: Password verification happens on the client side with Firebase SDK
            // For server-side, we generate a custom token that the client can use
            var token = await _firebaseAuth.CreateCustomTokenAsync(firebaseUser.Uid);

            var response = new AuthResponseDto
            {
                Token = token,
                User = _mapper.ToDto(user)
            };

            return Result.Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login failed");
            return Result.Fail<AuthResponseDto>($"Login failed: {ex.Message}");
        }
    }

    public async Task<Result<string>> VerifyTokenAsync(string token)
    {
        try
        {
            var decodedToken = await _firebaseAuth.VerifyIdTokenAsync(token);
            var uid = decodedToken.Uid;

            // Get Firebase user
            var firebaseUser = await _firebaseAuth.GetUserAsync(uid);

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
        catch (FirebaseAuthException ex)
        {
            _logger.LogError(ex, "Token verification failed");
            return Result.Fail<string>("Invalid or expired token.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Token verification error");
            return Result.Fail<string>($"Token verification failed: {ex.Message}");
        }
    }
}
