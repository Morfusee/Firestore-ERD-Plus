using backend.DTOs.Common;
using backend.DTOs.Project;
using FluentResults;

namespace backend.Services.ProjectService;

public interface IProjectService
{
    Task<Result<IEnumerable<ProjectResponseDto>>> GetAllProjectsAsync();
    Task<Result<IEnumerable<ProjectResponseDto>>> GetProjectsByEmailAsync(EmailDto emailDto);
    Task<Result<ProjectResponseDto>> GetProjectByIdAsync(string id);
    Task<Result<ProjectResponseDto>> CreateProjectAsync(CreateProjectDto createProjectDto);
    Task<Result<ProjectResponseDto>> UpdateProjectAsync(UpdateProjectDto updateProjectDto);
    Task<Result<ProjectResponseDto>> SaveProjectAsync(SaveProjectDto saveProjectDto);
    Task<Result<bool>> DeleteProjectAsync(string id);
}
