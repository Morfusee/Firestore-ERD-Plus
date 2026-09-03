using backend.Common.Providers;
using backend.DTOs.Common;
using backend.Mappers;
using backend.Services.AuthService;
using FluentResults;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
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

    private AuthService CreateService() =>
        new(
            _mongoDbContext,
            new UserMapper(),
            _authProvider.Object,
            _passwordResetProvider.Object,
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
}
