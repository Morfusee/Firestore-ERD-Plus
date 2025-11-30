
using backend_asp.Models;
using backend_asp.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace backend_asp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(UserService userService, ILogger<UsersController> logger) : ControllerBase
{
    private readonly UserService _userService = userService;
    private readonly ILogger<UsersController> _logger = logger;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        return Ok(await _userService.GetAllUsersAsync());
    }

    [HttpGet("{id:length(24)}")]
    public async Task<ActionResult<User>> GetUserById(string id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<User>> CreateUser([FromBody] User user)
    {
        return await _userService.CreateUserAsync(user);
    }

    [HttpPut("{id:length(24)}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] User updatedUser)
    {
        var user = await _userService.GetUserByIdAsync(id);

        if (user == null)
        {
            return NotFound();
        }

        updatedUser.Id = user.Id;
        updatedUser.UpdatedAt = DateTime.UtcNow;

        var result = await _userService.UpdateUserAsync(id, updatedUser);

        if (result == null)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpDelete("{id:length(24)}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var result = await _userService.DeleteUserAsync(id);

        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }
}