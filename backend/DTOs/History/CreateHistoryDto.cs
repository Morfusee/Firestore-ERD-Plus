using System.ComponentModel.DataAnnotations;
using backend.Models;

namespace backend.DTOs.History;

public class CreateHistoryDto
{
    [Required]
    public string Data { get; set; } = string.Empty;

    public List<Member>? Members { get; set; }
}
