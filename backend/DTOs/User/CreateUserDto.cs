using System.ComponentModel.DataAnnotations;
using backend.DTOs.Common;

namespace backend.DTOs.User;

public class CreateUserDto : EmailDto
{
    [Required]
    public required string Username { get; set; }

    public string? DisplayName { get; set; }
}
