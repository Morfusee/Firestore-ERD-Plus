using backend.DTOs.Common;
using backend.DTOs.History;
using FluentResults;

namespace backend.Services.HistoryService;

public interface IHistoryService
{
    Task<Result<PaginatedResponseDto<VersionResponseDto>>> GetProjectVersionsAsync(
        string projectId,
        PaginationDto pagination
    );
    Task<Result<VersionResponseDto>> CreateProjectVersionAsync(
        string projectId,
        CreateVersionDto dto
    );
    Task<Result<VersionResponseDto>> GetVersionByIdAsync(string versionId, string? projectId);
    Task<Result<VersionResponseDto>> UpdateVersionAsync(string versionId, UpdateVersionDto dto);
    Task<Result<bool>> DeleteVersionAsync(string versionId);

    Task<Result<PaginatedResponseDto<HistoryResponseDto>>> GetVersionHistoriesAsync(
        string versionId,
        PaginationDto pagination
    );
    Task<Result<HistoryResponseDto>> CreateVersionHistoryAsync(
        string versionId,
        CreateHistoryDto dto
    );
    Task<Result<HistoryResponseDto>> GetHistoryByIdAsync(string historyId, string? versionId);
    Task<Result<HistoryResponseDto>> UpdateHistoryAsync(string historyId, UpdateHistoryDto dto);
    Task<Result<bool>> DeleteHistoryAsync(string historyId);

    Task<Result<VersionResponseDto>> RollbackVersionToHistoryAsync(
        string versionId,
        string historyId
    );
}
