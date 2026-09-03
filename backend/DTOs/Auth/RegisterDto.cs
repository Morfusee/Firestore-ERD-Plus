using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Auth;

public class RegisterDto
{
    [Required]
    public required string IdToken { get; set; }

    [Required]
    [MinLength(3)]
    public required string Username { get; set; }

    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    public string? DisplayName { get; set; }
}
