using System.Net;
using System.Net.Http.Json;
using System.Text.Encodings.Web;
using backend.Controllers;
using backend.DTOs.Common;
using backend.Services.AuthService;
using FluentResults;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Moq;

namespace backend.Test.Http;

public class AuthHttpTests : IAsyncLifetime
{
    private readonly Mock<IAuthService> _authService = new();
    private WebApplication _app = null!;
    private HttpClient _client = null!;

    public async Task InitializeAsync()
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Services.AddControllers().AddApplicationPart(typeof(AuthController).Assembly);
        builder.Services.AddSingleton(_authService.Object);
        builder.Services.AddSingleton<ILogger<AuthController>>(NullLogger<AuthController>.Instance);

        _app = builder.Build();
        _app.MapControllers();
        await _app.StartAsync();

        _client = new HttpClient { BaseAddress = new Uri(_app.Urls.Single()) };
    }

    public async Task DisposeAsync()
    {
        _client.Dispose();
        await _app.DisposeAsync();
    }

    [Fact]
    public async Task ResetPassword_InvalidEmail_ReturnsBadRequestWithoutCallingService()
    {
        var response = await _client.PostAsJsonAsync(
            "/api/Auth/reset-password",
            new { email = "not-an-email" }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        _authService.Verify(s => s.ResetPasswordAsync(It.IsAny<EmailDto>()), Times.Never);
    }

    [Fact]
    public async Task ResetPassword_ValidEmail_DelegatesToService()
    {
        _authService
            .Setup(s => s.ResetPasswordAsync(It.IsAny<EmailDto>()))
            .ReturnsAsync(Result.Ok(true));

        var response = await _client.PostAsJsonAsync(
            "/api/Auth/reset-password",
            new { email = "user@example.com" }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        _authService.Verify(
            s => s.ResetPasswordAsync(It.Is<EmailDto>(d => d.Email == "user@example.com")),
            Times.Once
        );
    }
}
