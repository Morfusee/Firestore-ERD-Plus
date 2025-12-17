using backend.DTOs.Common;
using backend.Models;

namespace backend.DTOs.Project;

public class SaveProjectDto : ProjectIdDto
{
    public required string Data { get; set; }
    public List<Member> Members { get; set; } = [];
}
