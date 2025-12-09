using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Common;

public class EmailDto
{
    [EmailAddress]
    [Required]
    public required string Email { get; set; }
}
