using backend.DTOs.Common;
using backend.DTOs.Project;
using FluentResults;

namespace backend.Services.ProjectService;

public interface IProjectService
{
    Task<Result<PaginatedResponseDto<ProjectResponseDto>>> GetAllProjectsAsync(
        PaginationDto pagination
    );
    Task<Result<PaginatedResponseDto<ProjectResponseDto>>> GetProjectsByEmailAsync(
        EmailDto emailDto,
        PaginationDto pagination
    );
    Task<Result<ProjectResponseDto>> GetProjectByIdAsync(string id);
    Task<Result<ProjectResponseDto>> CreateProjectAsync(CreateProjectDto createProjectDto);
    Task<Result<ProjectResponseDto>> UpdateProjectAsync(UpdateProjectDto updateProjectDto);
    Task<Result<ProjectResponseDto>> SaveProjectAsync(SaveProjectDto saveProjectDto);
    Task<Result<bool>> DeleteProjectAsync(string id);
}
