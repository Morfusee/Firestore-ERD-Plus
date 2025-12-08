using System.Text.Json;
using backend.Common.Attributes;
using backend.Common.Providers;
using backend.Config;
using backend.DTOs.Auth;
using backend.DTOs.User;
using backend.Mappers;
using backend.Models;
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
    FirebaseAuthProvider firebaseAuthProvider,
    ILogger<AuthService> logger
) : IAuthService
{
    private readonly MongoDbContext _context = context;
    private readonly UserMapper _userMapper = userMapper;
    private readonly ILogger<AuthService> _logger = logger;
    private readonly FirebaseAuth _firebaseAuth = firebaseAuthProvider.Auth;

    public async Task<Result<AuthResponseDto>> LoginAsync(LoginDto loginDto)
    {
        try
        {
            var token = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(loginDto.IdToken);

            var uid = token.Uid;
            var firebaseUser = await _firebaseAuth.GetUserAsync(uid);
            if (firebaseUser == null)
            {
                return Result.Fail<AuthResponseDto>("Invalid authentication token.");
            }

            // Note: Password verification happens on the client side with Firebase SDK
            // For server-side, we generate a custom token that the client can use
            var user = await _context
                .Users.Find(u =>
                    u.Email.Equals(firebaseUser.Email, StringComparison.CurrentCultureIgnoreCase)
                )
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return Result.Fail<AuthResponseDto>("User not found.");
            }

            var response = new AuthResponseDto { User = _userMapper.ToDto(user) };

            return Result.Ok(response);
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

            // Create user in Firebase Auth
            var userRecordArgs = new UserRecordArgs
            {
                Email = registerDto.Email,
                Password = registerDto.Password,
                EmailVerified = false,
                DisplayName = registerDto.DisplayName ?? registerDto.Username,
            };

            UserRecord firebaseUser = await _firebaseAuth.CreateUserAsync(userRecordArgs);

            if (firebaseUser == null)
            {
                return Result.Fail<AuthResponseDto>("Failed to create user in Firebase.");
            }

            // Create user in MongoDB
            var newUser = new CreateUserDto
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                DisplayName = registerDto.DisplayName ?? registerDto.Username,
            };

            await _context.Users.InsertOneAsync(_userMapper.ToUser(newUser));

            var response = new AuthResponseDto
            {
                User = _userMapper.ToDto(_userMapper.ToUser(newUser)),
            };

            return Result.Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Registration failed");
            return Result.Fail<AuthResponseDto>($"Registration failed: {ex.Message}");
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

    public async Task<Result<AuthResponseDto>> GoogleAuthAsync(GoogleAuthDto googleAuthDto)
    {
        try
        {
            // Verify the Google ID token with Firebase
            var decodedToken = await _firebaseAuth.VerifyIdTokenAsync(googleAuthDto.IdToken);

            // Get or create Firebase user
            UserRecord firebaseUser = await _firebaseAuth.GetUserAsync(decodedToken.Uid);

            if (firebaseUser == null)
            {
                return Result.Fail<AuthResponseDto>("Invalid Google authentication token.");
            }

            if (string.IsNullOrEmpty(firebaseUser.Email))
            {
                return Result.Fail<AuthResponseDto>("Email not provided by Google account.");
            }

            // Check if user exists in MongoDB
            var existingUser = await _context
                .Users.Find(u =>
                    u.Email.Equals(firebaseUser.Email, StringComparison.CurrentCultureIgnoreCase)
                )
                .FirstOrDefaultAsync();

            User user;

            if (existingUser == null)
            {
                // Create new user in MongoDB
                var username = firebaseUser.Email.Split('@')[0]; // Generate username from email
                var displayName = firebaseUser.DisplayName ?? username;

                // Check if username already exists and make it unique if needed
                var usernameExists = await _context
                    .Users.Find(u =>
                        u.Username.Equals(username, StringComparison.CurrentCultureIgnoreCase)
                    )
                    .FirstOrDefaultAsync();

                if (usernameExists != null)
                {
                    username = $"{username}_{Guid.NewGuid().ToString().Substring(0, 8)}";
                }

                user = _userMapper.ToUser(
                    new CreateUserDto
                    {
                        Username = username,
                        Email = firebaseUser.Email,
                        DisplayName = displayName,
                    }
                );

                await _context.Users.InsertOneAsync(user);
                _logger.LogInformation(
                    "Created new user via Google OAuth: {Email}",
                    firebaseUser.Email
                );
            }
            else
            {
                user = existingUser;
                _logger.LogInformation(
                    "Existing user logged in via Google OAuth: {Email}",
                    firebaseUser.Email
                );
            }

            // Return the ID token and user data
            var response = new AuthResponseDto { User = _userMapper.ToDto(user) };

            return Result.Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Google authentication failed.");
            return Result
                .Fail<AuthResponseDto>("Google authentication failed.")
                .WithError(ex.Message);
        }
    }
}
