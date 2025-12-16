using backend.DTOs.Common;
using backend.Models;

namespace backend.DTOs.Project;

public class SaveProjectDto : ProjectIdDto
{
    public string Data { get; set; } = string.Empty;
    public List<Member> Members { get; set; } = [];
}
