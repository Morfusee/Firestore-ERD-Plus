using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Auth;

public class GoogleAuthDto
{
    [Required]
    public required string IdToken { get; set; }
}
