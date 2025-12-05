using backend.Common.Extensions;
using backend.Common.Models;
using backend.DTOs.Auth;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService, ILogger<AuthController> logger)
    : ControllerBase
{
    private readonly IAuthService _authService = authService;
    private readonly ILogger<AuthController> _logger = logger;

    /// <summary>
    /// Register a new user with email and password
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register(
        [FromBody] RegisterDto registerDto
    )
    {
        var result = await _authService.RegisterAsync(registerDto);

        if (result.IsFailed)
        {
            return BadRequest(
                new ProblemDetails
                {
                    Title = "Registration failed",
                    Detail = result.Errors[0].Message,
                    Status = StatusCodes.Status400BadRequest,
                }
            );
        }

        // Set token in HTTP-only cookie
        Response.Cookies.Append(
            "access_token",
            result.Value.Token,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Use HTTPS in production
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(7),
            }
        );

        return this.ToApiResponse<AuthResponseDto>(result.Value);
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login(
        [FromBody] LoginDto loginDto
    )
    {
        var result = await _authService.LoginAsync(loginDto);

        if (result.IsFailed)
        {
            return Unauthorized(
                new ProblemDetails
                {
                    Title = "Login failed",
                    Detail = result.Errors[0].Message,
                    Status = StatusCodes.Status401Unauthorized,
                }
            );
        }

        // Set token in HTTP-only cookie
        Response.Cookies.Append(
            "access_token",
            result.Value.Token,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Use HTTPS in production
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(7),
            }
        );

        return this.ToApiResponse<AuthResponseDto>(result.Value);
    }

    /// <summary>
    /// Logout the current user
    /// </summary>
    [HttpPost("logout")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public ActionResult<ApiResponse<object>> Logout()
    {
        // Clear the access token cookie
        Response.Cookies.Delete("access_token");

        return this.ToApiResponse<object>(new { message = "Logged out successfully" });
    }

    /// <summary>
    /// Get current authenticated user information
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<object>>> GetCurrentUser()
    {
        // Get token from cookie
        if (!Request.Cookies.TryGetValue("access_token", out var token))
        {
            return Unauthorized(
                new ProblemDetails
                {
                    Title = "Unauthorized",
                    Detail = "No authentication token found",
                    Status = StatusCodes.Status401Unauthorized,
                }
            );
        }

        var result = await _authService.VerifyTokenAsync(token);

        if (result.IsFailed)
        {
            return Unauthorized(
                new ProblemDetails
                {
                    Title = "Unauthorized",
                    Detail = result.Errors[0].Message,
                    Status = StatusCodes.Status401Unauthorized,
                }
            );
        }

        return this.ToApiResponse<object>(new { UserId = result.Value });
    }
}
