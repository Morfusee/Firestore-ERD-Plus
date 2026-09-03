using backend.Common.Attributes;
using backend.Common.Extensions;
using backend.Common.Providers;
using backend.DTOs.Auth;
using backend.DTOs.Common;
using backend.DTOs.User;
using backend.Mappers;
using backend.Models;
using backend.Services.UserService;
using FluentResults;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Util;
using MongoDB.Driver;
using System.Text.Json;

namespace backend.Services.AuthService;

[ScopedService]
public class AuthService(
    MongoDbContext context,
    UserMapper userMapper,
    IFirebaseAuthProvider firebaseAuthProvider,
    IFirebasePasswordResetProvider passwordResetProvider,
    IUserService userService,
    IConfiguration configuration,
    ILogger<AuthService> logger
) : IAuthService
{
    private readonly MongoDbContext _context = context;
    private readonly UserMapper _userMapper = userMapper;
    private readonly ILogger<AuthService> _logger = logger;
    private readonly IFirebaseAuthProvider _firebaseAuthProvider = firebaseAuthProvider;
    private readonly IFirebasePasswordResetProvider _passwordResetProvider = passwordResetProvider;
    private readonly IUserService _userService = userService;
    private readonly string _frontendOrigin =
        configuration.GetValue<string>("Frontend:Origin") ?? "http://localhost:5173";

    public async Task<Result<AuthResponseDto>> LoginAsync(LoginDto loginDto)
    {
        try
        {
            var identity = await _firebaseAuthProvider.VerifyIdentityAsync(loginDto.IdToken);
            if (identity.IsFailed)
            {
                return Result
                    .Fail<AuthResponseDto>(
                        new Error("Invalid authentication token.").WithMetadata(
                            "Unauthorized",
                            true
                        )
                    )
                    .WithErrors(identity.Errors);
            }

            // Note: Password verification happens on the client side with Firebase SDK
            var user = await _context
                .Users.Find(u =>
                    u.Email.Equals(identity.Value.Email, StringComparison.CurrentCultureIgnoreCase)
                )
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return ResultExtensions.NotFound<AuthResponseDto>("User not found.");
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
            if (string.IsNullOrWhiteSpace(registerDto.IdToken))
            {
                return Result.Fail<AuthResponseDto>(
                    new Error("Authentication token is required.").WithMetadata(
                        "ValidationError",
                        true
                    )
                );
            }

            var identity = await _firebaseAuthProvider.VerifyIdentityAsync(registerDto.IdToken);
            if (identity.IsFailed)
            {
                return Result
                    .Fail<AuthResponseDto>(
                        new Error("Invalid authentication token.").WithMetadata(
                            "Unauthorized",
                            true
                        )
                    )
                    .WithErrors(identity.Errors);
            }

            // ponytail: email-match, no FirebaseUid column; add uid tracking when email-change/linking matters.
            if (
                !identity.Value.Email.Equals(
                    registerDto.Email,
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                return Result.Fail<AuthResponseDto>(
                    new Error(
                        "Identity mismatch: email does not match the verified token."
                    ).WithMetadata("ValidationError", true)
                );
            }

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
                    new Error(
                        existingUser.Email == registerDto.Email
                            ? "Email is already in use."
                            : "Username is already in use."
                    ).WithMetadata("Conflict", true)
                );
            }

            // Provision through the same invariant as normal user creation:
            // default settings are created and the user is rolled back when settings fail.
            var created = await _userService.CreateUserAsync(
                new CreateUserDto
                {
                    Username = registerDto.Username,
                    Email = identity.Value.Email,
                    DisplayName = registerDto.DisplayName ?? registerDto.Username,
                }
            );

            if (created.IsFailed)
            {
                return Result.Fail<AuthResponseDto>(created.Errors);
            }

            return Result.Ok(new AuthResponseDto { User = created.Value });
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
            var identity = await _firebaseAuthProvider.VerifyIdentityAsync(token);
            if (identity.IsFailed)
            {
                return Result
                    .Fail<string>("Token verification failed.")
                    .WithErrors(identity.Errors);
            }

            // Find corresponding user in MongoDB
            var user = await _context
                .Users.Find(u => u.Email == identity.Value.Email)
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
            var identity = await _firebaseAuthProvider.VerifyIdentityAsync(googleAuthDto.IdToken);
            if (identity.IsFailed)
            {
                return Result
                    .Fail<AuthResponseDto>(
                        new Error("Invalid Google authentication token.").WithMetadata(
                            "Unauthorized",
                            true
                        )
                    )
                    .WithErrors(identity.Errors);
            }

            // Check if user exists in MongoDB
            var existingUser = await _context
                .Users.Find(u =>
                    u.Email.Equals(identity.Value.Email, StringComparison.CurrentCultureIgnoreCase)
                )
                .FirstOrDefaultAsync();

            User user;

            if (existingUser == null)
            {
                // Create new user in MongoDB
                var username = identity.Value.Email.Split('@')[0]; // Generate username from email
                var displayName = identity.Value.DisplayName ?? username;

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

                var created = await _userService.CreateUserAsync(
                    new CreateUserDto
                    {
                        Username = username,
                        Email = identity.Value.Email,
                        DisplayName = displayName,
                    }
                );

                if (created.IsFailed)
                {
                    return Result.Fail<AuthResponseDto>(created.Errors);
                }

                user = _userMapper.ToUser(created.Value);
                _logger.LogInformation(
                    "Created new user via Google OAuth: {Email}",
                    identity.Value.Email
                );
            }
            else
            {
                user = existingUser;
                _logger.LogInformation(
                    "Existing user logged in via Google OAuth: {Email}",
                    identity.Value.Email
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

    public async Task<Result<bool>> ResetPasswordAsync(EmailDto emailDto)
    {
        var reset = await _passwordResetProvider.SendPasswordResetEmailAsync(
            emailDto.Email,
            _frontendOrigin
        );

        return
            reset.IsSuccess
            || reset.Errors.Any(error => error.Metadata?.ContainsKey("EmailNotFound") == true)
            ? Result.Ok(true)
            : Result.Fail<bool>(reset.Errors);
    }
}
