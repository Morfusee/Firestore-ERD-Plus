
using backend_asp.DTOs.User;
using backend_asp.Models;
using backend_asp.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend_asp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(IUserService userService, ILogger<UsersController> logger) : ControllerBase
{
    private readonly IUserService _userService = userService;
    private readonly ILogger<UsersController> _logger = logger;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetUsers()
    {
        return Ok(await _userService.GetAllUsersAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserResponseDto>> GetUserById(string id)
    {
        var user = await _userService.GetUserByIdAsync(id);

        if (user == null) return NotFound();

        return Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<UserResponseDto>> CreateUser([FromBody] CreateUserDto user)
    {
        var createdUser = await _userService.CreateUserAsync(user);
        
        return CreatedAtAction(nameof(GetUserById), new { id = createdUser.Id }, createdUser);
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

        if (!result) return NotFound();

        return NoContent();
    }
}