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
        typeof(ApiResponse<IEnumerable<ProjectResponseDto>>),
        StatusCodes.Status200OK
    )]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<IEnumerable<ProjectResponseDto>>>> GetAllProjects()
    {
        var projects = await _projectService.GetAllProjectsAsync();

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

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ProjectResponseDto>>> CreateProject(
        [FromBody] CreateProjectDto createProjectDto
    )
    {
        var project = await _projectService.CreateProjectAsync(createProjectDto);

        return this.ToApiResponse(project);
    }
}
