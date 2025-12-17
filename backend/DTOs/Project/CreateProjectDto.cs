using backend.DTOs.Common;

namespace backend.DTOs.Project;

public class CreateProjectDto : EmailDto
{
    public required string Name { get; set; }
    public required string Icon { get; set; }
}
