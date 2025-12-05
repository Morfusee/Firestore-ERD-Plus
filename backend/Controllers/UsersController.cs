using backend.Common.Extensions;
using backend.Common.Models;
using backend.DTOs.User;
using backend.Services.UserService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(IUserService userService, ILogger<UsersController> logger)
    : ControllerBase
{
    private readonly IUserService _userService = userService;
    private readonly ILogger<UsersController> _logger = logger;

    [HttpGet]
    [Authorize]
    [ProducesResponseType(
        typeof(ApiResponse<IEnumerable<UserResponseDto>>),
        StatusCodes.Status200OK
    )]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<IEnumerable<UserResponseDto>>>> GetUsers()
    {
        var users = await _userService.GetAllUsersAsync();

        return this.ToApiResponse(users);
    }

    [HttpGet("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<UserResponseDto>>> GetUserById(string id)
    {
        var user = await _userService.GetUserByIdAsync(id);

        return this.ToApiResponse(user)!;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<UserResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<UserResponseDto>>> CreateUser(
        [FromBody] CreateUserDto user
    )
    {
        var createdUser = await _userService.CreateUserAsync(user);

        return this.ToApiResponse(createdUser);
    }

    [HttpPut("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<UserResponseDto>>> UpdateUser(
        string id,
        [FromBody] UpdateUserDto updatedUser
    )
    {
        var result = await _userService.UpdateUserAsync(id, updatedUser);

        return this.ToApiResponse(result);
    }

    [HttpDelete("{id}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteUser(string id)
    {
        var result = await _userService.DeleteUserAsync(id);

        return this.ToApiResponse(result);
    }
}
