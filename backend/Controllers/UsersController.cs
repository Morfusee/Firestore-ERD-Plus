using backend.Common.Extensions;
using backend.Common.Models;
using backend.DTOs.Common;
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
        typeof(ApiResponse<PaginatedResponseDto<UserResponseDto>>),
        StatusCodes.Status200OK
    )]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<PaginatedResponseDto<UserResponseDto>>>> GetUsers(
        [FromQuery] PaginationDto pagination
    )
    {
        var users = await _userService.GetAllUsersAsync(pagination);

        return this.ToApiResponse(users);
    }

    [HttpGet("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<UserResponseDto>>> GetUserById(string id)
    {
        var user = await _userService.GetUserByIdAsync(id);

        return this.ToApiResponse(user)!;
    }

    [HttpGet("email/{email}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<UserResponseDto>>> GetUserByEmail(string email)
    {
        var user = await _userService.GetUserByEmailAsync(email);

        return this.ToApiResponse(user)!;
    }

    [HttpPost("search")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserSearchResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<UserSearchResponseDto>>> SearchUsers(
        [FromBody] UserSearchDto search
    )
    {
        var result = await _userService.SearchUsersAsync(search);

        return this.ToApiResponse(result);
    }

    [HttpPost]
    [Authorize]
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
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteUser(string id)
    {
        var result = await _userService.DeleteUserAsync(id);

        return this.ToApiResponse(result);
    }
}
