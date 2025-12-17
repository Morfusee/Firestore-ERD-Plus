using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.User;

public class UpdateUserDto
{
    public string? Username { get; set; }

    [EmailAddress]
    public required string Email { get; set; }

    public string? DisplayName { get; set; }
    public string? ProfilePicture { get; set; }
}
