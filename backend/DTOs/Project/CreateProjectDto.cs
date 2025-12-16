using backend.DTOs.Common;

namespace backend.DTOs.Project;

public class CreateProjectDto : EmailDto
{
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
}
