using backend.Common.Extensions;
using backend.Common.Models;
using backend.DTOs.Common;
using backend.DTOs.Project;
using backend.Services.ProjectService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectController(IProjectService projectService) : ControllerBase
{
    private readonly IProjectService _projectService = projectService;

    [HttpGet]
    [ProducesResponseType(
        typeof(ApiResponse<PaginatedResponseDto<ProjectResponseDto>>),
        StatusCodes.Status200OK
    )]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<
        ActionResult<ApiResponse<PaginatedResponseDto<ProjectResponseDto>>>
    > GetAllProjects([FromQuery] PaginationDto pagination)
    {
        var projects = await _projectService.GetAllProjectsAsync(pagination);

        return this.ToApiResponse(projects);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<ProjectResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ProjectResponseDto>>> GetProjectById(
        [FromRoute(Name = "id")] string id
    )
    {
        var project = await _projectService.GetProjectByIdAsync(id);

        return this.ToApiResponse(project);
    }

    [HttpGet("by-email")]
    [ProducesResponseType(
        typeof(ApiResponse<PaginatedResponseDto<ProjectResponseDto>>),
        StatusCodes.Status200OK
    )]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<
        ActionResult<ApiResponse<PaginatedResponseDto<ProjectResponseDto>>>
    > GetProjectsByEmail(
        [FromQuery(Name = "")] EmailDto email,
        [FromQuery(Name = "")] PaginationDto pagination
    )
    {
        var project = await _projectService.GetProjectsByEmailAsync(email, pagination);

        return this.ToApiResponse(project);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ProjectResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ProjectResponseDto>>> CreateProject(
        [FromBody] CreateProjectDto createProjectDto
    )
    {
        var project = await _projectService.CreateProjectAsync(createProjectDto);

        return this.ToApiResponse(project);
    }

    [HttpPatch]
    [ProducesResponseType(typeof(ApiResponse<ProjectResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ProjectResponseDto>>> SaveProject(
        [FromBody] SaveProjectDto saveProjectDto
    )
    {
        var project = await _projectService.SaveProjectAsync(saveProjectDto);

        return this.ToApiResponse(project);
    }

    [HttpPatch("details")]
    [ProducesResponseType(typeof(ApiResponse<ProjectResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ProjectResponseDto>>> UpdateProject(
        [FromBody] UpdateProjectDto updateProjectDto
    )
    {
        var project = await _projectService.UpdateProjectAsync(updateProjectDto);

        return this.ToApiResponse(project);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteProject(
        [FromRoute(Name = "id")] string id
    )
    {
        var result = await _projectService.DeleteProjectAsync(id);

        return this.ToApiResponse(result);
    }
}
