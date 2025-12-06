using backend.Common.Extensions;
using backend.Common.Models;
using backend.DTOs.Auth;
using backend.Services.AuthService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService, ILogger<AuthController> logger)
    : ControllerBase
{
    private readonly IAuthService _authService = authService;
    private readonly ILogger<AuthController> _logger = logger;

    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register(
        [FromBody] RegisterDto registerDto
    )
    {
        var result = await _authService.RegisterAsync(registerDto);

        if (result.IsSuccess)
        {
            Response.Cookies.Append(
                "access_token",
                result.Value.Token,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddDays(7),
                }
            );
        }

        return this.ToApiResponse(result);
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login(
        [FromBody] LoginDto loginDto
    )
    {
        var result = await _authService.LoginAsync(loginDto);

        return this.ToApiResponse(result);
    }

    /// <summary>
    /// Authenticate with Google OAuth
    /// </summary>
    [HttpPost("google")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> GoogleAuth(
        [FromBody] GoogleAuthDto googleAuthDto
    )
    {
        var result = await _authService.GoogleAuthAsync(googleAuthDto);

        if (result.IsSuccess)
        {
            Response.Cookies.Append(
                "access_token",
                result.Value.Token,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddDays(7),
                }
            );
        }

        return this.ToApiResponse(result);
    }

    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public ActionResult<ApiResponse<object>> Logout()
    {
        // Clear the access token cookie
        Response.Cookies.Delete("access_token");

        return this.ToApiResponse<object>(new { message = "Logged out successfully." });
    }

    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<object>>> GetCurrentUser()
    {
        if (!Request.Cookies.TryGetValue("access_token", out var token))
        {
            return Unauthorized(
                new ApiResponse<object>(
                    new object(),
                    "No access token provided.",
                    StatusCodes.Status401Unauthorized
                )
            );
        }

        var result = await _authService.VerifyTokenAsync(token);

        return this.ToApiResponse<object>(new { UserId = result.Value });
    }
}
