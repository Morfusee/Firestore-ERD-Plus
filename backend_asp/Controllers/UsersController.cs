
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
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        return Ok(await _userService.GetAllUsersAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUserById(string id)
    {
        return Ok(await _userService.GetUserByIdAsync(id));
    }

    [HttpPost]
    public async Task<ActionResult<User>> CreateUser([FromBody] User user)
    {
        return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] User updatedUser)
    {
        var result = await _userService.UpdateUserAsync(id, updatedUser);

        if (result == null) return NotFound();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var result = await _userService.DeleteUserAsync(id);

        if (!result) return NotFound();

        return NoContent();
    }
}