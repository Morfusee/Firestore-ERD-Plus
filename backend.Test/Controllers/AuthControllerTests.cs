using backend.Common.Models;
using backend.Controllers;
using backend.DTOs.Auth;
using backend.DTOs.User;
using backend.Services.AuthService;
using FluentResults;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace backend.Test.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _authService = new();

    private AuthController CreateController(string? cookie = null)
    {
        var context = new DefaultHttpContext();
        if (cookie != null)
            context.Request.Headers.Cookie = cookie;

        return new AuthController(_authService.Object, NullLogger<AuthController>.Instance)
        {
            ControllerContext = new ControllerContext { HttpContext = context },
        };
    }

    private static AuthResponseDto Response() =>
        new()
        {
            User = new UserResponseDto
            {
                Id = "507f1f77bcf86cd799439011",
                Email = "auth@example.com",
                Username = "auth-user",
            },
        };

    [Fact]
    public async Task Register_ForwardsDtoAndMapsServiceResult()
    {
        var dto = new RegisterDto { Email = "auth@example.com", Username = "auth-user" };
        _authService.Setup(s => s.RegisterAsync(dto)).ReturnsAsync(Result.Ok(Response()));

        var action = await CreateController().Register(dto);

        Assert.Equal(
            StatusCodes.Status200OK,
            Assert.IsType<ObjectResult>(action.Result).StatusCode
        );
        _authService.Verify(s => s.RegisterAsync(dto), Times.Once);
    }

    [Fact]
    public async Task Login_ForwardsDtoAndMapsServiceResult()
    {
        var dto = new LoginDto { IdToken = "firebase-token" };
        _authService.Setup(s => s.LoginAsync(dto)).ReturnsAsync(Result.Ok(Response()));

        var action = await CreateController().Login(dto);

        Assert.Equal(
            StatusCodes.Status200OK,
            Assert.IsType<ObjectResult>(action.Result).StatusCode
        );
        _authService.Verify(s => s.LoginAsync(dto), Times.Once);
    }

    [Fact]
    public async Task GoogleAuth_ForwardsDtoAndMapsServiceResult()
    {
        var dto = new GoogleAuthDto { IdToken = "google-token" };
        _authService.Setup(s => s.GoogleAuthAsync(dto)).ReturnsAsync(Result.Ok(Response()));

        var action = await CreateController().GoogleAuth(dto);

        Assert.Equal(
            StatusCodes.Status200OK,
            Assert.IsType<ObjectResult>(action.Result).StatusCode
        );
        _authService.Verify(s => s.GoogleAuthAsync(dto), Times.Once);
    }

    [Fact]
    public void Logout_DeletesAccessTokenCookieAndReturnsSuccess()
    {
        var controller = CreateController("access_token=existing-token");

        var action = controller.Logout();

        var response = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
        Assert.Contains(
            controller.Response.Headers.SetCookie,
            value =>
                value!.StartsWith("access_token=", StringComparison.Ordinal)
                && value.Contains("expires=", StringComparison.OrdinalIgnoreCase)
        );
    }

    [Fact]
    public async Task GetCurrentUser_WithoutAccessToken_ReturnsUnauthorizedWithoutCallingService()
    {
        var action = await CreateController().GetCurrentUser();

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(action.Result);
        var body = Assert.IsType<ApiResponse<object>>(unauthorized.Value);
        Assert.Equal(StatusCodes.Status401Unauthorized, body.Status);
        Assert.Equal("No access token provided.", body.Message);
        Assert.False(body.IsSuccess);
        _authService.Verify(s => s.VerifyTokenAsync(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task GetCurrentUser_WithAccessToken_ForwardsTokenAndReturnsUserId()
    {
        _authService
            .Setup(s => s.VerifyTokenAsync("cookie-token"))
            .ReturnsAsync(Result.Ok("firebase-user-id"));

        var action = await CreateController("access_token=cookie-token").GetCurrentUser();

        var response = Assert.IsType<ObjectResult>(action.Result);
        var body = Assert.IsType<ApiResponse<object>>(response.Value);
        Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
        Assert.Equal(
            "firebase-user-id",
            body.Data.GetType().GetProperty("UserId")!.GetValue(body.Data)
        );
        _authService.Verify(s => s.VerifyTokenAsync("cookie-token"), Times.Once);
    }
}
