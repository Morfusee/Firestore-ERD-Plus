using backend.Common.Attributes;
using backend.Common.Extensions;
using backend.DTOs.Common;
using backend.DTOs.History;
using backend.Mappers;
using backend.Models;
using FluentResults;
using MongoDB.Driver;

namespace backend.Services.HistoryService;

[ScopedService]
public class HistoryService(MongoDbContext context, HistoryMapper mapper) : IHistoryService
{
    private readonly MongoDbContext _context = context;
    private readonly HistoryMapper _mapper = mapper;

    public async Task<Result<PaginatedResponseDto<VersionResponseDto>>> GetProjectVersionsAsync(
        string projectId,
        PaginationDto pagination
    )
    {
        try
        {
            var project = await _context
                .Projects.Find(p => p.Id == projectId)
                .FirstOrDefaultAsync();
            if (project == null)
                return ResultExtensions.NotFound<PaginatedResponseDto<VersionResponseDto>>(
                    "Project not found"
                );

            var versions = await _context
                .Versions.Find(v => v.ProjectId == projectId)
                .ToPaginatedListAsync(pagination, v => _mapper.ToDto(v));

            return Result.Ok(versions);
        }
        catch (Exception ex)
        {
            return Result
                .Fail<PaginatedResponseDto<VersionResponseDto>>("Failed to retrieve versions")
                .WithError(ex.Message);
        }
    }

    public async Task<Result<VersionResponseDto>> CreateProjectVersionAsync(
        string projectId,
        CreateVersionDto dto
    )
    {
        try
        {
            var project = await _context
                .Projects.Find(p => p.Id == projectId)
                .FirstOrDefaultAsync();
            if (project == null)
                return ResultExtensions.NotFound<VersionResponseDto>("Project not found");

            var existing = await _context
                .Versions.Find(v => v.ProjectId == projectId && v.Name == dto.Name)
                .FirstOrDefaultAsync();
            if (existing != null)
                return Result.Fail<VersionResponseDto>(
                    new Error(
                        "Version with this name already exists for this project"
                    ).WithMetadata("Conflict", true)
                );

            var version = new Models.Version
            {
                Name = dto.Name,
                Description = dto.Description,
                ProjectId = projectId,
            };

            await _context.Versions.InsertOneAsync(version);

            return Result.Ok(_mapper.ToDto(version));
        }
        catch (Exception ex)
        {
            return Result
                .Fail<VersionResponseDto>("Failed to create version")
                .WithError(ex.Message);
        }
    }

    public async Task<Result<VersionResponseDto>> GetVersionByIdAsync(
        string versionId,
        string? projectId
    )
    {
        try
        {
            var filter = Builders<Models.Version>.Filter.Eq(v => v.Id, versionId);
            if (!string.IsNullOrEmpty(projectId))
                filter &= Builders<Models.Version>.Filter.Eq(v => v.ProjectId, projectId);

            var version = await _context.Versions.Find(filter).FirstOrDefaultAsync();
            if (version == null)
                return ResultExtensions.NotFound<VersionResponseDto>("Version not found");

            return Result.Ok(_mapper.ToDto(version));
        }
        catch (Exception ex)
        {
            return Result
                .Fail<VersionResponseDto>("Failed to retrieve version")
                .WithError(ex.Message);
        }
    }

    public async Task<Result<VersionResponseDto>> UpdateVersionAsync(
        string versionId,
        UpdateVersionDto dto
    )
    {
        try
        {
            var updateDefinition = Builders<Models.Version>.Update.Set(
                v => v.UpdatedAt,
                DateTime.UtcNow
            );

            if (!string.IsNullOrEmpty(dto.Name))
                updateDefinition = updateDefinition.Set(v => v.Name, dto.Name);
            if (dto.Description != null)
                updateDefinition = updateDefinition.Set(v => v.Description, dto.Description);

            var updated = await _context.Versions.FindOneAndUpdateAsync(
                v => v.Id == versionId,
                updateDefinition,
                new FindOneAndUpdateOptions<Models.Version>
                {
                    ReturnDocument = ReturnDocument.After,
                }
            );

            if (updated == null)
                return ResultExtensions.NotFound<VersionResponseDto>("Version not found");

            return Result.Ok(_mapper.ToDto(updated));
        }
        catch (Exception ex)
        {
            return Result
                .Fail<VersionResponseDto>("Failed to update version")
                .WithError(ex.Message);
        }
    }

    public async Task<Result<bool>> DeleteVersionAsync(string versionId)
    {
        try
        {
            var version = await _context
                .Versions.Find(v => v.Id == versionId)
                .FirstOrDefaultAsync();
            if (version == null)
                return ResultExtensions.NotFound<bool>("Version not found");

            await _context.Histories.DeleteManyAsync(h => h.VersionId == versionId);
            await _context.Versions.DeleteOneAsync(v => v.Id == versionId);

            return Result.Ok(true);
        }
        catch (Exception ex)
        {
            return Result.Fail<bool>("Failed to delete version").WithError(ex.Message);
        }
    }

    public async Task<Result<PaginatedResponseDto<HistoryResponseDto>>> GetVersionHistoriesAsync(
        string versionId,
        PaginationDto pagination
    )
    {
        try
        {
            var version = await _context
                .Versions.Find(v => v.Id == versionId)
                .FirstOrDefaultAsync();
            if (version == null)
                return ResultExtensions.NotFound<PaginatedResponseDto<HistoryResponseDto>>(
                    "Version not found"
                );

            var histories = await _context
                .Histories.Find(h => h.VersionId == versionId)
                .SortBy(h => h.CreatedAt)
                .ToPaginatedListAsync(pagination, h => _mapper.ToDto(h));

            return Result.Ok(histories);
        }
        catch (Exception ex)
        {
            return Result
                .Fail<PaginatedResponseDto<HistoryResponseDto>>("Failed to retrieve histories")
                .WithError(ex.Message);
        }
    }

    public async Task<Result<HistoryResponseDto>> CreateVersionHistoryAsync(
        string versionId,
        CreateHistoryDto dto
    )
    {
        try
        {
            var version = await _context
                .Versions.Find(v => v.Id == versionId)
                .FirstOrDefaultAsync();
            if (version == null)
                return ResultExtensions.NotFound<HistoryResponseDto>("Version not found");

            var history = new History
            {
                VersionId = versionId,
                Data = dto.Data,
                Members = dto.Members ?? [],
                IsRollback = false,
            };

            await _context.Histories.InsertOneAsync(history);

            await _context.Versions.UpdateOneAsync(
                v => v.Id == versionId,
                Builders<Models.Version>.Update.Set(v => v.CurrentHistoryId, history.Id)
            );

            return Result.Ok(_mapper.ToDto(history));
        }
        catch (Exception ex)
        {
            return Result
                .Fail<HistoryResponseDto>("Failed to create history entry")
                .WithError(ex.Message);
        }
    }

    public async Task<Result<HistoryResponseDto>> GetHistoryByIdAsync(
        string historyId,
        string? versionId
    )
    {
        try
        {
            var filter = Builders<History>.Filter.Eq(h => h.Id, historyId);
            if (!string.IsNullOrEmpty(versionId))
                filter &= Builders<History>.Filter.Eq(h => h.VersionId, versionId);

            var history = await _context.Histories.Find(filter).FirstOrDefaultAsync();
            if (history == null)
                return ResultExtensions.NotFound<HistoryResponseDto>("History entry not found");

            return Result.Ok(_mapper.ToDto(history));
        }
        catch (Exception ex)
        {
            return Result
                .Fail<HistoryResponseDto>("Failed to retrieve history entry")
                .WithError(ex.Message);
        }
    }

    public async Task<Result<HistoryResponseDto>> UpdateHistoryAsync(
        string historyId,
        UpdateHistoryDto dto
    )
    {
        try
        {
            var updateDefinition = Builders<History>.Update.Set(h => h.UpdatedAt, DateTime.UtcNow);

            if (dto.Data != null)
                updateDefinition = updateDefinition.Set(h => h.Data, dto.Data);
            if (dto.Members != null)
                updateDefinition = updateDefinition.Set(h => h.Members, dto.Members);

            var updated = await _context.Histories.FindOneAndUpdateAsync(
                h => h.Id == historyId,
                updateDefinition,
                new FindOneAndUpdateOptions<History> { ReturnDocument = ReturnDocument.After }
            );

            if (updated == null)
                return ResultExtensions.NotFound<HistoryResponseDto>("History entry not found");

            return Result.Ok(_mapper.ToDto(updated));
        }
        catch (Exception ex)
        {
            return Result
                .Fail<HistoryResponseDto>("Failed to update history entry")
                .WithError(ex.Message);
        }
    }

    public async Task<Result<bool>> DeleteHistoryAsync(string historyId)
    {
        try
        {
            var history = await _context
                .Histories.Find(h => h.Id == historyId)
                .FirstOrDefaultAsync();
            if (history == null)
                return ResultExtensions.NotFound<bool>("History entry not found");

            await _context.Histories.DeleteManyAsync(h =>
                h.VersionId == history.VersionId && h.CreatedAt > history.CreatedAt
            );

            await _context.Histories.DeleteOneAsync(h => h.Id == historyId);

            await RepairCurrentHistoryId(history.VersionId);

            return Result.Ok(true);
        }
        catch (Exception ex)
        {
            return Result.Fail<bool>("Failed to delete history entry").WithError(ex.Message);
        }
    }

    public async Task<Result<VersionResponseDto>> RollbackVersionToHistoryAsync(
        string versionId,
        string historyId
    )
    {
        try
        {
            var version = await _context
                .Versions.Find(v => v.Id == versionId)
                .FirstOrDefaultAsync();
            if (version == null)
                return ResultExtensions.NotFound<VersionResponseDto>("Version not found");

            var target = await _context
                .Histories.Find(h => h.Id == historyId)
                .FirstOrDefaultAsync();
            if (target == null || target.VersionId != versionId)
                return ResultExtensions.NotFound<VersionResponseDto>(
                    "History entry not found or does not belong to this version"
                );

            var rollback = new History
            {
                VersionId = versionId,
                Data = target.Data,
                Members = target.Members,
                IsRollback = true,
            };

            await _context.Histories.InsertOneAsync(rollback);

            await _context.Versions.UpdateOneAsync(
                v => v.Id == versionId,
                Builders<Models.Version>.Update.Set(v => v.CurrentHistoryId, rollback.Id)
            );

            var updatedVersion = await _context
                .Versions.Find(v => v.Id == versionId)
                .FirstOrDefaultAsync();

            return Result.Ok(_mapper.ToDto(updatedVersion!));
        }
        catch (Exception ex)
        {
            return Result
                .Fail<VersionResponseDto>("Failed to roll back version")
                .WithError(ex.Message);
        }
    }

    private async Task RepairCurrentHistoryId(string versionId)
    {
        var version = await _context.Versions.Find(v => v.Id == versionId).FirstOrDefaultAsync();
        if (version == null)
            return;

        var latestHistory = await _context
            .Histories.Find(h => h.VersionId == versionId)
            .SortByDescending(h => h.CreatedAt)
            .FirstOrDefaultAsync();

        await _context.Versions.UpdateOneAsync(
            v => v.Id == versionId,
            Builders<Models.Version>.Update.Set(v => v.CurrentHistoryId, latestHistory?.Id)
        );
    }
}
