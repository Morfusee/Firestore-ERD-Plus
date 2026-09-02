using System.Security.Claims;
using backend.Common.Extensions;
using backend.Common.Models;
using backend.DTOs.Common;
using backend.DTOs.History;
using backend.Services.HistoryService;
using backend.Services.ProjectAuthorizationService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HistoryController(
    IHistoryService historyService,
    IProjectAuthorizationService authorizationService
) : ControllerBase
{
    private readonly IHistoryService _historyService = historyService;
    private readonly IProjectAuthorizationService _authorizationService = authorizationService;

    [HttpGet("projects/{projectId}/versions")]
    [Authorize]
    public async Task<
        ActionResult<ApiResponse<PaginatedResponseDto<VersionResponseDto>>>
    > GetProjectVersions([FromRoute] string projectId, [FromQuery] PaginationDto pagination)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (!await _authorizationService.CanAccessProjectAsync(projectId, userId, ProjectPermission.Read))
        {
            return this.ToApiResponse(
                ResultExtensions.NotFound<PaginatedResponseDto<VersionResponseDto>>("Resource not found")
            );
        }

        var result = await _historyService.GetProjectVersionsAsync(projectId, pagination);
        return this.ToApiResponse(result);
    }

    [HttpPost("projects/{projectId}/versions")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<VersionResponseDto>>> CreateProjectVersion(
        [FromRoute] string projectId,
        [FromBody] CreateVersionDto dto
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (!await _authorizationService.CanAccessProjectAsync(projectId, userId, ProjectPermission.Write))
        {
            return this.ToApiResponse(ResultExtensions.NotFound<VersionResponseDto>("Resource not found"));
        }

        var result = await _historyService.CreateProjectVersionAsync(projectId, dto);
        return this.ToApiResponse(result);
    }

    [HttpGet("versions/{versionId}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<VersionResponseDto>>> GetVersionById(
        [FromRoute] string versionId,
        [FromQuery] string? projectId
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (!await _authorizationService.CanAccessVersionAsync(versionId, userId, ProjectPermission.Read))
        {
            return this.ToApiResponse(ResultExtensions.NotFound<VersionResponseDto>("Resource not found"));
        }

        var result = await _historyService.GetVersionByIdAsync(versionId, projectId);
        return this.ToApiResponse(result);
    }

    [HttpPatch("versions/{versionId}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<VersionResponseDto>>> UpdateVersion(
        [FromRoute] string versionId,
        [FromBody] UpdateVersionDto dto
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (!await _authorizationService.CanAccessVersionAsync(versionId, userId, ProjectPermission.Write))
        {
            return this.ToApiResponse(ResultExtensions.NotFound<VersionResponseDto>("Resource not found"));
        }

        var result = await _historyService.UpdateVersionAsync(versionId, dto);
        return this.ToApiResponse(result);
    }

    [HttpDelete("versions/{versionId}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteVersion([FromRoute] string versionId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (!await _authorizationService.CanAccessVersionAsync(versionId, userId, ProjectPermission.Admin))
        {
            return this.ToApiResponse(ResultExtensions.NotFound<bool>("Resource not found"));
        }

        var result = await _historyService.DeleteVersionAsync(versionId);
        return this.ToApiResponse(result);
    }

    [HttpGet("versions/{versionId}/histories")]
    [Authorize]
    public async Task<
        ActionResult<ApiResponse<PaginatedResponseDto<HistoryResponseDto>>>
    > GetVersionHistories([FromRoute] string versionId, [FromQuery] PaginationDto pagination)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (!await _authorizationService.CanAccessVersionAsync(versionId, userId, ProjectPermission.Read))
        {
            return this.ToApiResponse(
                ResultExtensions.NotFound<PaginatedResponseDto<HistoryResponseDto>>("Resource not found")
            );
        }

        var result = await _historyService.GetVersionHistoriesAsync(versionId, pagination);
        return this.ToApiResponse(result);
    }

    [HttpPost("versions/{versionId}/histories")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<HistoryResponseDto>>> CreateVersionHistory(
        [FromRoute] string versionId,
        [FromBody] CreateHistoryDto dto
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (!await _authorizationService.CanAccessVersionAsync(versionId, userId, ProjectPermission.Write))
        {
            return this.ToApiResponse(ResultExtensions.NotFound<HistoryResponseDto>("Resource not found"));
        }

        var result = await _historyService.CreateVersionHistoryAsync(versionId, dto);
        return this.ToApiResponse(result);
    }

    [HttpGet("histories/{historyId}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<HistoryResponseDto>>> GetHistoryById(
        [FromRoute] string historyId,
        [FromQuery] string? versionId
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (!await _authorizationService.CanAccessHistoryAsync(historyId, userId, ProjectPermission.Read))
        {
            return this.ToApiResponse(ResultExtensions.NotFound<HistoryResponseDto>("Resource not found"));
        }

        var result = await _historyService.GetHistoryByIdAsync(historyId, versionId);
        return this.ToApiResponse(result);
    }

    [HttpPatch("histories/{historyId}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<HistoryResponseDto>>> UpdateHistory(
        [FromRoute] string historyId,
        [FromBody] UpdateHistoryDto dto
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (!await _authorizationService.CanAccessHistoryAsync(historyId, userId, ProjectPermission.Write))
        {
            return this.ToApiResponse(ResultExtensions.NotFound<HistoryResponseDto>("Resource not found"));
        }

        var result = await _historyService.UpdateHistoryAsync(historyId, dto);
        return this.ToApiResponse(result);
    }

    [HttpDelete("histories/{historyId}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteHistory([FromRoute] string historyId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (!await _authorizationService.CanAccessHistoryAsync(historyId, userId, ProjectPermission.Admin))
        {
            return this.ToApiResponse(ResultExtensions.NotFound<bool>("Resource not found"));
        }

        var result = await _historyService.DeleteHistoryAsync(historyId);
        return this.ToApiResponse(result);
    }

    [HttpPost("versions/{versionId}/rollback/{historyId}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<VersionResponseDto>>> RollbackVersion(
        [FromRoute] string versionId,
        [FromRoute] string historyId
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (
            !await _authorizationService.CanAccessVersionAsync(versionId, userId, ProjectPermission.Admin)
            || !await _authorizationService.CanAccessHistoryAsync(historyId, userId, ProjectPermission.Admin)
        )
        {
            return this.ToApiResponse(ResultExtensions.NotFound<VersionResponseDto>("Resource not found"));
        }

        var result = await _historyService.RollbackVersionToHistoryAsync(versionId, historyId);
        return this.ToApiResponse(result);
    }
}
