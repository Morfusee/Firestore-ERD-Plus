using backend.Models;

namespace backend.DTOs.History;

public class UpdateHistoryDto
{
    public string? Data { get; set; }
    public List<Member>? Members { get; set; }
}
