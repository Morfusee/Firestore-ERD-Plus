using backend.Common.Providers;
using backend.DTOs.Auth;
using backend.DTOs.Common;
using backend.DTOs.User;
using backend.Mappers;
using backend.Services.AuthService;
using backend.Services.SettingsService;
using backend.Services.UserService;
using FluentResults;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using MongoDB.Driver;
using Moq;

namespace backend.Test.Services;

public class AuthServiceTests : TestDBContext
{
    private readonly Mock<IFirebaseAuthProvider> _authProvider = new();
    private readonly Mock<IFirebasePasswordResetProvider> _passwordResetProvider = new();

    public AuthServiceTests()
    {
        _authProvider.SetupGet(p => p.Auth).Returns((FirebaseAdmin.Auth.FirebaseAuth)null!);
    }

    private AuthService CreateService(ISettingsService? settingsService = null) =>
        new(
            _mongoDbContext,
            new UserMapper(),
            _authProvider.Object,
            _passwordResetProvider.Object,
            new UserService(
                _mongoDbContext,
                settingsService ?? new SettingsService(_mongoDbContext, new SettingsMapper()),
                new UserMapper()
            ),
            new ConfigurationBuilder()
                .AddInMemoryCollection(
                    new Dictionary<string, string?>
                    {
                        ["Frontend:Origin"] = "https://frontend.example",
                    }
                )
                .Build(),
            NullLogger<AuthService>.Instance
        );

    private void VerifyIdentity(string uid, string email, string? displayName = null) =>
        _authProvider
            .Setup(p =>
                p.VerifyIdentityAsync(It.IsAny<string>(), It.IsAny<CancellationToken>())
            )
            .ReturnsAsync(Result.Ok(new VerifiedFirebaseUser(uid, email, displayName)));

    private void VerifyIdentityFails() =>
        _authProvider
            .Setup(p =>
                p.VerifyIdentityAsync(It.IsAny<string>(), It.IsAny<CancellationToken>())
            )
            .ReturnsAsync(Result.Fail<VerifiedFirebaseUser>("Token verification failed."));

    [Fact]
    public async Task ResetPasswordAsync_ProviderSucceeds_ForwardsConfiguredOrigin()
    {
        _passwordResetProvider
            .Setup(p =>
                p.SendPasswordResetEmailAsync("user@example.com", "https://frontend.example")
            )
            .ReturnsAsync(Result.Ok());

        var result = await CreateService()
            .ResetPasswordAsync(new EmailDto { Email = "user@example.com" });

        Assert.True(result.IsSuccess);
        _passwordResetProvider.Verify(
            p => p.SendPasswordResetEmailAsync("user@example.com", "https://frontend.example"),
            Times.Once
        );
    }

    [Fact]
    public async Task ResetPasswordAsync_UnknownEmail_ReturnsGenericSuccess()
    {
        _passwordResetProvider
            .Setup(p => p.SendPasswordResetEmailAsync(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(Result.Fail(new Error("ignored").WithMetadata("EmailNotFound", true)));

        var result = await CreateService()
            .ResetPasswordAsync(new EmailDto { Email = "missing@example.com" });

        Assert.True(result.IsSuccess);
    }

    [Fact]
    public async Task ResetPasswordAsync_ProviderUnavailable_ReturnsExternalServiceError()
    {
        _passwordResetProvider
            .Setup(p => p.SendPasswordResetEmailAsync(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(
                Result.Fail(
                    new Error("Password reset is currently unavailable.").WithMetadata(
                        "ExternalServiceError",
                        true
                    )
                )
            );

        var result = await CreateService()
            .ResetPasswordAsync(new EmailDto { Email = "user@example.com" });

        Assert.True(result.IsFailed);
        Assert.Contains(result.Errors, e => e.Metadata.ContainsKey("ExternalServiceError"));
    }

    [Fact]
    public async Task RegisterAsync_ValidToken_CreatesUserAndDefaultSettings()
    {
        VerifyIdentity("firebase-uid-1", "newuser@example.com");
        var dto = new RegisterDto
        {
            IdToken = "valid-token",
            Username = "newuser",
            Email = "newuser@example.com",
        };

        var result = await CreateService().RegisterAsync(dto);

        Assert.True(result.IsSuccess);
        var user = await _mongoDbContext
            .Users.Find(u => u.Email == "newuser@example.com")
            .FirstOrDefaultAsync();
        Assert.NotNull(user);
        Assert.Equal(result.Value.User.Id, user.Id);
        var settings = await _mongoDbContext
            .Settings.Find(s => s.UserId == user.Id)
            .FirstOrDefaultAsync();
        Assert.NotNull(settings);
    }

    [Fact]
    public async Task RegisterAsync_MismatchedEmail_ReturnsValidationErrorWithoutCreatingUser()
    {
        VerifyIdentity("firebase-uid-2", "token-owner@example.com");
        var dto = new RegisterDto
        {
            IdToken = "valid-token",
            Username = "claimed",
            Email = "claimed@example.com",
        };

        var result = await CreateService().RegisterAsync(dto);

        Assert.True(result.IsFailed);
        Assert.Contains(result.Errors, e => e.Metadata.ContainsKey("ValidationError"));
        Assert.Null(
            await _mongoDbContext
                .Users.Find(u => u.Email == "claimed@example.com")
                .FirstOrDefaultAsync()
        );
    }

    [Fact]
    public async Task RegisterAsync_DuplicateEmail_ReturnsConflict()
    {
        VerifyIdentity("firebase-uid-3", "test@example.com");
        var dto = new RegisterDto
        {
            IdToken = "valid-token",
            Username = "othername",
            Email = "test@example.com",
        };

        var result = await CreateService().RegisterAsync(dto);

        Assert.True(result.IsFailed);
        Assert.Contains(result.Errors, e => e.Metadata.ContainsKey("Conflict"));
        Assert.Equal("Email is already in use.", result.Errors[0].Message);
    }

    [Fact]
    public async Task RegisterAsync_DuplicateUsername_ReturnsConflict()
    {
        VerifyIdentity("firebase-uid-4", "fresh@example.com");
        var dto = new RegisterDto
        {
            IdToken = "valid-token",
            Username = "testuser",
            Email = "fresh@example.com",
        };

        var result = await CreateService().RegisterAsync(dto);

        Assert.True(result.IsFailed);
        Assert.Contains(result.Errors, e => e.Metadata.ContainsKey("Conflict"));
        Assert.Equal("Username is already in use.", result.Errors[0].Message);
    }

    [Fact]
    public async Task RegisterAsync_InvalidToken_ReturnsUnauthorized()
    {
        VerifyIdentityFails();
        var dto = new RegisterDto
        {
            IdToken = "expired-token",
            Username = "nobody",
            Email = "nobody@example.com",
        };

        var result = await CreateService().RegisterAsync(dto);

        Assert.True(result.IsFailed);
        Assert.Contains(result.Errors, e => e.Metadata.ContainsKey("Unauthorized"));
    }

    [Fact]
    public async Task RegisterAsync_SettingsFailure_RollsBackUser()
    {
        VerifyIdentity("firebase-uid-5", "rollback@example.com");
        var settingsMock = new Mock<ISettingsService>();
        settingsMock
            .Setup(s => s.CreateSettingsAsync(It.IsAny<DTOs.Settings.CreateSettingsDto>()))
            .ReturnsAsync(Result.Fail<DTOs.Settings.SettingsResponseDto>("settings down"));
        var dto = new RegisterDto
        {
            IdToken = "valid-token",
            Username = "rollback",
            Email = "rollback@example.com",
        };

        var result = await CreateService(settingsMock.Object).RegisterAsync(dto);

        Assert.True(result.IsFailed);
        Assert.Null(
            await _mongoDbContext
                .Users.Find(u => u.Email == "rollback@example.com")
                .FirstOrDefaultAsync()
        );
    }

    [Fact]
    public async Task GoogleAuthAsync_NewUser_CreatesUserAndDefaultSettings()
    {
        VerifyIdentity("google-uid-1", "googler@example.com", "Googler");
        var dto = new GoogleAuthDto { IdToken = "google-token" };

        var result = await CreateService().GoogleAuthAsync(dto);

        Assert.True(result.IsSuccess);
        var user = await _mongoDbContext
            .Users.Find(u => u.Email == "googler@example.com")
            .FirstOrDefaultAsync();
        Assert.NotNull(user);
        Assert.NotNull(
            await _mongoDbContext.Settings.Find(s => s.UserId == user.Id).FirstOrDefaultAsync()
        );
    }

    [Fact]
    public async Task LoginAsync_UnknownUser_ReturnsNotFound()
    {
        VerifyIdentity("firebase-uid-6", "ghost@example.com");

        var result = await CreateService()
            .LoginAsync(new LoginDto { IdToken = "valid-token" });

        Assert.True(result.IsFailed);
        Assert.Contains(result.Errors, e => e.Metadata.ContainsKey("NotFound"));
    }

    [Fact]
    public async Task VerifyTokenAsync_ValidToken_ReturnsUserId()
    {
        VerifyIdentity("firebase-uid-7", "test@example.com");

        var result = await CreateService().VerifyTokenAsync("valid-token");

        Assert.True(result.IsSuccess);
        Assert.Equal(MockUser.Id, result.Value);
    }
}
