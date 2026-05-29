using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.History;

public class CreateVersionDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
}
