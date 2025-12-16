using backend.Common.Attributes;
using backend.DTOs.Project;
using backend.Models;
using Riok.Mapperly.Abstractions;

namespace backend.Mappers;

[Mapper(RequiredMappingStrategy = RequiredMappingStrategy.Source)]
[SingletonService]
public partial class ProjectMapper
{
    public partial ProjectResponseDto ToDto(Project project);

    public Project ToProject(CreateProjectDto dto, string userId)
    {
        return new Project
        {
            Name = dto.Name,
            Icon = dto.Icon,
            Members = [new Member { UserId = userId, Role = MemberRole.Owner }],
        };
    }
}
