using backend.Common.Extensions;
using backend.Common.Models;
using backend.DTOs.Common;
using backend.DTOs.History;
using backend.Services.HistoryService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HistoryController(IHistoryService historyService) : ControllerBase
{
    private readonly IHistoryService _historyService = historyService;

    [HttpGet("projects/{projectId}/versions")]
    public async Task<
        ActionResult<ApiResponse<PaginatedResponseDto<VersionResponseDto>>>
    > GetProjectVersions(
        [FromRoute] string projectId,
        [FromQuery] PaginationDto pagination
    )
    {
        var result = await _historyService.GetProjectVersionsAsync(projectId, pagination);
        return this.ToApiResponse(result);
    }

    [HttpPost("projects/{projectId}/versions")]
    public async Task<
        ActionResult<ApiResponse<VersionResponseDto>>
    > CreateProjectVersion(
        [FromRoute] string projectId,
        [FromBody] CreateVersionDto dto
    )
    {
        var result = await _historyService.CreateProjectVersionAsync(projectId, dto);
        return this.ToApiResponse(result);
    }

    [HttpGet("versions/{versionId}")]
    public async Task<
        ActionResult<ApiResponse<VersionResponseDto>>
    > GetVersionById(
        [FromRoute] string versionId,
        [FromQuery] string? projectId
    )
    {
        var result = await _historyService.GetVersionByIdAsync(versionId, projectId);
        return this.ToApiResponse(result);
    }

    [HttpPatch("versions/{versionId}")]
    public async Task<
        ActionResult<ApiResponse<VersionResponseDto>>
    > UpdateVersion(
        [FromRoute] string versionId,
        [FromBody] UpdateVersionDto dto
    )
    {
        var result = await _historyService.UpdateVersionAsync(versionId, dto);
        return this.ToApiResponse(result);
    }

    [HttpDelete("versions/{versionId}")]
    public async Task<
        ActionResult<ApiResponse<bool>>
    > DeleteVersion([FromRoute] string versionId)
    {
        var result = await _historyService.DeleteVersionAsync(versionId);
        return this.ToApiResponse(result);
    }

    [HttpGet("versions/{versionId}/histories")]
    public async Task<
        ActionResult<ApiResponse<PaginatedResponseDto<HistoryResponseDto>>>
    > GetVersionHistories(
        [FromRoute] string versionId,
        [FromQuery] PaginationDto pagination
    )
    {
        var result = await _historyService.GetVersionHistoriesAsync(versionId, pagination);
        return this.ToApiResponse(result);
    }

    [HttpPost("versions/{versionId}/histories")]
    public async Task<
        ActionResult<ApiResponse<HistoryResponseDto>>
    > CreateVersionHistory(
        [FromRoute] string versionId,
        [FromBody] CreateHistoryDto dto
    )
    {
        var result = await _historyService.CreateVersionHistoryAsync(versionId, dto);
        return this.ToApiResponse(result);
    }

    [HttpGet("histories/{historyId}")]
    public async Task<
        ActionResult<ApiResponse<HistoryResponseDto>>
    > GetHistoryById(
        [FromRoute] string historyId,
        [FromQuery] string? versionId
    )
    {
        var result = await _historyService.GetHistoryByIdAsync(historyId, versionId);
        return this.ToApiResponse(result);
    }

    [HttpPatch("histories/{historyId}")]
    public async Task<
        ActionResult<ApiResponse<HistoryResponseDto>>
    > UpdateHistory(
        [FromRoute] string historyId,
        [FromBody] UpdateHistoryDto dto
    )
    {
        var result = await _historyService.UpdateHistoryAsync(historyId, dto);
        return this.ToApiResponse(result);
    }

    [HttpDelete("histories/{historyId}")]
    public async Task<
        ActionResult<ApiResponse<bool>>
    > DeleteHistory([FromRoute] string historyId)
    {
        var result = await _historyService.DeleteHistoryAsync(historyId);
        return this.ToApiResponse(result);
    }

    [HttpPost("versions/{versionId}/rollback/{historyId}")]
    public async Task<
        ActionResult<ApiResponse<VersionResponseDto>>
    > RollbackVersion(
        [FromRoute] string versionId,
        [FromRoute] string historyId
    )
    {
        var result = await _historyService.RollbackVersionToHistoryAsync(versionId, historyId);
        return this.ToApiResponse(result);
    }
}
