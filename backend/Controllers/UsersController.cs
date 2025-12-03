
using backend.DTOs.User;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(IUserService userService, ILogger<UsersController> logger) : ControllerBase
{
    private readonly IUserService _userService = userService;
    private readonly ILogger<UsersController> _logger = logger;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetUsers()
    {
        var users = await _userService.GetAllUsersAsync();

        if (users.IsFailed)
        {
            return StatusCode(500, "An error occurred while retrieving users.");
        }

        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserResponseDto>> GetUserById(string id)
    {
        var user = await _userService.GetUserByIdAsync(id);

        if (user == null) return NotFound();

        return Ok(user.Value);
    }

    [HttpPost]
    public async Task<ActionResult<UserResponseDto>> CreateUser([FromBody] CreateUserDto user)
    {
        var createdUser = await _userService.CreateUserAsync(user);

        if (createdUser.IsFailed)
        {
            return StatusCode(500, createdUser.Errors[0].Message);
        }

        return CreatedAtAction(nameof(GetUserById), new { id = createdUser.Value.Id }, createdUser);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto updatedUser)
    {
        var result = await _userService.UpdateUserAsync(id, updatedUser);

        if (result == null) return NotFound();

        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var result = await _userService.DeleteUserAsync(id);

        if (result.IsFailed || !result.Value)
        {
            return StatusCode(500, result.Errors[0].Message);
        }

        return NoContent();
    }
}