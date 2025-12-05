using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.User;

public class CreateUserDto
{
    [Required]
    public required string Username { get; set; }

    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    public string? DisplayName { get; set; }
}
