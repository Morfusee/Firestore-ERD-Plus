using System.Security.Claims;
using backend.Common.Extensions;
using backend.Common.Models;
using backend.DTOs.Common;
using backend.DTOs.Project;
using backend.Services.ProjectAuthorizationService;
using backend.Services.ProjectService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectController(
    IProjectService projectService,
    IProjectAuthorizationService authorizationService
) : ControllerBase
{
    private readonly IProjectService _projectService = projectService;
    private readonly IProjectAuthorizationService _authorizationService = authorizationService;

    [HttpGet]
    [Authorize]
    [ProducesResponseType(
        typeof(ApiResponse<PaginatedResponseDto<ProjectResponseDto>>),
        StatusCodes.Status200OK
    )]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<
        ActionResult<ApiResponse<PaginatedResponseDto<ProjectResponseDto>>>
    > GetAllProjects([FromQuery] PaginationDto pagination)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var filter = _authorizationService.GetAccessibleProjectsFilter(userId);
        var projects = await _projectService.GetAllProjectsAsync(pagination, filter);

        return this.ToApiResponse(projects);
    }

    [HttpGet("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<ProjectResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ProjectResponseDto>>> GetProjectById(
        [FromRoute(Name = "id")] string id
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (!await _authorizationService.CanAccessProjectAsync(id, userId, ProjectPermission.Read))
        {
            return this.ToApiResponse(ResultExtensions.NotFound<ProjectResponseDto>("Project not found"));
        }

        var project = await _projectService.GetProjectByIdAsync(id);

        return this.ToApiResponse(project);
    }

    [HttpGet("by-email")]
    [Authorize]
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
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (!await _authorizationService.MatchesUserEmailAsync(userId, email.Email))
        {
            return this.ToApiResponse(ResultExtensions.NotFound<PaginatedResponseDto<ProjectResponseDto>>("Project not found"));
        }

        var project = await _projectService.GetProjectsByEmailAsync(email, pagination);

        return this.ToApiResponse(project);
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<ProjectResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ProjectResponseDto>>> CreateProject(
        [FromBody] CreateProjectDto createProjectDto
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (!await _authorizationService.MatchesUserEmailAsync(userId, createProjectDto.Email))
        {
            return this.ToApiResponse(ResultExtensions.NotFound<ProjectResponseDto>("Project not found"));
        }

        var project = await _projectService.CreateProjectAsync(createProjectDto);

        return this.ToApiResponse(project);
    }

    [HttpPatch]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<ProjectResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ProjectResponseDto>>> SaveProject(
        [FromBody] SaveProjectDto saveProjectDto
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (!await _authorizationService.CanAccessProjectAsync(saveProjectDto.Id, userId, ProjectPermission.Write))
        {
            return this.ToApiResponse(ResultExtensions.NotFound<ProjectResponseDto>("Project not found"));
        }

        var project = await _projectService.SaveProjectAsync(saveProjectDto);

        return this.ToApiResponse(project);
    }

    [HttpPatch("details")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<ProjectResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ProjectResponseDto>>> UpdateProject(
        [FromBody] UpdateProjectDto updateProjectDto
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (!await _authorizationService.CanAccessProjectAsync(updateProjectDto.Id, userId, ProjectPermission.Admin))
        {
            return this.ToApiResponse(ResultExtensions.NotFound<ProjectResponseDto>("Project not found"));
        }

        var project = await _projectService.UpdateProjectAsync(updateProjectDto);

        return this.ToApiResponse(project);
    }

    [HttpDelete("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteProject(
        [FromRoute(Name = "id")] string id
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (!await _authorizationService.CanAccessProjectAsync(id, userId, ProjectPermission.Admin))
        {
            return this.ToApiResponse(ResultExtensions.NotFound<bool>("Project not found"));
        }

        var result = await _projectService.DeleteProjectAsync(id);

        return this.ToApiResponse(result);
    }
}
