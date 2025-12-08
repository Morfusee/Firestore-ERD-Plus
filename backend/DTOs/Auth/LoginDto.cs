using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Auth;

public class LoginDto
{
    [Required]
    public required string IdToken { get; set; }
}
