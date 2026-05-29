using backend.DTOs.Common;
using backend.DTOs.History;
using backend.Mappers;
using backend.Services;
using backend.Services.HistoryService;
using MongoDB.Driver;

namespace backend.Test.Services;

public class HistoryServiceTests : TestDBContext
{
    private readonly MongoDbContext _context;
    private readonly HistoryMapper _mapper;
    private readonly IHistoryService _historyService;

    public HistoryServiceTests()
    {
        _context = _mongoDbContext;
        _mapper = new HistoryMapper();
        _historyService = new HistoryService(_context, _mapper);
    }

    private async Task<string> GetSeededProjectId()
    {
        var project = await _context.Projects.Find(_ => true).FirstOrDefaultAsync();
        return project!.Id!;
    }

    private PaginationDto DefaultPagination => new() { Page = 1, Limit = 10 };

    [Fact]
    public async Task CreateProjectVersion_WithValidData_ReturnsSuccess()
    {
        var projectId = await GetSeededProjectId();
        var dto = new CreateVersionDto { Name = "1.0.0", Description = "Initial release" };

        var result = await _historyService.CreateProjectVersionAsync(projectId, dto);

        Assert.True(result.IsSuccess);
        Assert.Equal("1.0.0", result.Value.Name);
        Assert.Equal("Initial release", result.Value.Description);
        Assert.Equal(projectId, result.Value.ProjectId);
        Assert.NotNull(result.Value.Id);
    }

    [Fact]
    public async Task CreateProjectVersion_WithMissingProject_ReturnsNotFound()
    {
        var dto = new CreateVersionDto { Name = "1.0.0" };

        var result = await _historyService.CreateProjectVersionAsync(
            "507f1f77bcf86cd799439012",
            dto
        );

        Assert.True(result.IsFailed);
        Assert.Contains("Project not found", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task CreateProjectVersion_DuplicateName_ReturnsConflict()
    {
        var projectId = await GetSeededProjectId();
        var dto = new CreateVersionDto { Name = "1.0.0" };

        await _historyService.CreateProjectVersionAsync(projectId, dto);
        var result = await _historyService.CreateProjectVersionAsync(projectId, dto);

        Assert.True(result.IsFailed);
        Assert.Contains(
            result.Errors.Select(e => e.Message),
            e => e.Contains("already exists")
        );
        Assert.True(result.Errors.Any(e => e.Metadata.ContainsKey("Conflict")));
    }

    [Fact]
    public async Task GetProjectVersions_ReturnsPaginatedList()
    {
        var projectId = await GetSeededProjectId();
        await _historyService.CreateProjectVersionAsync(
            projectId,
            new CreateVersionDto { Name = "1.0.0" }
        );
        await _historyService.CreateProjectVersionAsync(
            projectId,
            new CreateVersionDto { Name = "2.0.0" }
        );

        var result = await _historyService.GetProjectVersionsAsync(projectId, DefaultPagination);

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Value.TotalCount);
        Assert.Equal(2, result.Value.Items!.Count());
    }

    [Fact]
    public async Task GetVersionById_ReturnsVersion()
    {
        var projectId = await GetSeededProjectId();
        var createResult = await _historyService.CreateProjectVersionAsync(
            projectId,
            new CreateVersionDto { Name = "1.0.0" }
        );

        var result = await _historyService.GetVersionByIdAsync(createResult.Value.Id!, null);

        Assert.True(result.IsSuccess);
        Assert.Equal(createResult.Value.Id, result.Value.Id);
        Assert.Equal("1.0.0", result.Value.Name);
    }

    [Fact]
    public async Task UpdateVersion_UpdatesFields()
    {
        var projectId = await GetSeededProjectId();
        var createResult = await _historyService.CreateProjectVersionAsync(
            projectId,
            new CreateVersionDto { Name = "1.0.0" }
        );

        var result = await _historyService.UpdateVersionAsync(
            createResult.Value.Id!,
            new UpdateVersionDto { Name = "2.0.0", Description = "Updated" }
        );

        Assert.True(result.IsSuccess);
        Assert.Equal("2.0.0", result.Value.Name);
        Assert.Equal("Updated", result.Value.Description);
    }

    [Fact]
    public async Task DeleteVersion_RemovesRelatedHistories()
    {
        var projectId = await GetSeededProjectId();
        var versionResult = await _historyService.CreateProjectVersionAsync(
            projectId,
            new CreateVersionDto { Name = "1.0.0" }
        );
        var versionId = versionResult.Value.Id!;

        await _historyService.CreateVersionHistoryAsync(
            versionId,
            new CreateHistoryDto { Data = "{\"tables\": []}" }
        );
        await _historyService.CreateVersionHistoryAsync(
            versionId,
            new CreateHistoryDto { Data = "{\"tables\": [\"t1\"]}" }
        );

        var deleteResult = await _historyService.DeleteVersionAsync(versionId);

        Assert.True(deleteResult.IsSuccess);
        Assert.True(deleteResult.Value);

        var remainingHistories = await _context
            .Histories.Find(h => h.VersionId == versionId)
            .ToListAsync();
        Assert.Empty(remainingHistories);
    }

    [Fact]
    public async Task CreateVersionHistory_UpdatesCurrentHistoryId()
    {
        var projectId = await GetSeededProjectId();
        var versionResult = await _historyService.CreateProjectVersionAsync(
            projectId,
            new CreateVersionDto { Name = "1.0.0" }
        );
        var versionId = versionResult.Value.Id!;

        var historyResult = await _historyService.CreateVersionHistoryAsync(
            versionId,
            new CreateHistoryDto { Data = "{\"tables\": []}" }
        );

        Assert.True(historyResult.IsSuccess);

        var version = await _context.Versions.Find(v => v.Id == versionId).FirstOrDefaultAsync();
        Assert.Equal(historyResult.Value.Id, version!.CurrentHistoryId);
    }

    [Fact]
    public async Task CreateVersionHistory_MissingVersion_ReturnsNotFound()
    {
        var result = await _historyService.CreateVersionHistoryAsync(
            "507f1f77bcf86cd799439012",
            new CreateHistoryDto { Data = "{\"tables\": []}" }
        );

        Assert.True(result.IsFailed);
        Assert.Contains("Version not found", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task GetVersionHistories_ReturnsPaginatedList()
    {
        var projectId = await GetSeededProjectId();
        var versionResult = await _historyService.CreateProjectVersionAsync(
            projectId,
            new CreateVersionDto { Name = "1.0.0" }
        );
        var versionId = versionResult.Value.Id!;

        await _historyService.CreateVersionHistoryAsync(
            versionId,
            new CreateHistoryDto { Data = "{\"tables\": []}" }
        );
        await _historyService.CreateVersionHistoryAsync(
            versionId,
            new CreateHistoryDto { Data = "{\"tables\": [\"t1\"]}" }
        );

        var result = await _historyService.GetVersionHistoriesAsync(versionId, DefaultPagination);

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Value.TotalCount);
    }

    [Fact]
    public async Task GetHistoryById_ReturnsHistory()
    {
        var projectId = await GetSeededProjectId();
        var versionResult = await _historyService.CreateProjectVersionAsync(
            projectId,
            new CreateVersionDto { Name = "1.0.0" }
        );
        var historyResult = await _historyService.CreateVersionHistoryAsync(
            versionResult.Value.Id!,
            new CreateHistoryDto { Data = "{\"tables\": []}" }
        );

        var result = await _historyService.GetHistoryByIdAsync(historyResult.Value.Id!, null);

        Assert.True(result.IsSuccess);
        Assert.Equal(historyResult.Value.Id, result.Value.Id);
        Assert.Equal("{\"tables\": []}", result.Value.Data);
    }

    [Fact]
    public async Task UpdateHistory_UpdatesFields()
    {
        var projectId = await GetSeededProjectId();
        var versionResult = await _historyService.CreateProjectVersionAsync(
            projectId,
            new CreateVersionDto { Name = "1.0.0" }
        );
        var historyResult = await _historyService.CreateVersionHistoryAsync(
            versionResult.Value.Id!,
            new CreateHistoryDto { Data = "{\"tables\": []}" }
        );

        var result = await _historyService.UpdateHistoryAsync(
            historyResult.Value.Id!,
            new UpdateHistoryDto { Data = "{\"tables\": [\"t1\"]}" }
        );

        Assert.True(result.IsSuccess);
        Assert.Equal("{\"tables\": [\"t1\"]}", result.Value.Data);
    }

    [Fact]
    public async Task DeleteHistory_RemovesLaterHistories_AndRepairsCurrentHistoryId()
    {
        var projectId = await GetSeededProjectId();
        var versionResult = await _historyService.CreateProjectVersionAsync(
            projectId,
            new CreateVersionDto { Name = "1.0.0" }
        );
        var versionId = versionResult.Value.Id!;

        var h1 = await _historyService.CreateVersionHistoryAsync(
            versionId,
            new CreateHistoryDto { Data = "{\"tables\": [\"a\"]}" }
        );
        var h2 = await _historyService.CreateVersionHistoryAsync(
            versionId,
            new CreateHistoryDto { Data = "{\"tables\": [\"b\"]}" }
        );
        var h3 = await _historyService.CreateVersionHistoryAsync(
            versionId,
            new CreateHistoryDto { Data = "{\"tables\": [\"c\"]}" }
        );

        var deleteResult = await _historyService.DeleteHistoryAsync(h2.Value.Id!);

        Assert.True(deleteResult.IsSuccess);
        Assert.True(deleteResult.Value);

        var remaining = await _context
            .Histories.Find(h => h.VersionId == versionId)
            .ToListAsync();
        Assert.Single(remaining);
        Assert.Equal(h1.Value.Id, remaining[0].Id);

        var version = await _context.Versions.Find(v => v.Id == versionId).FirstOrDefaultAsync();
        Assert.Equal(h1.Value.Id, version!.CurrentHistoryId);
    }

    [Fact]
    public async Task DeleteHistory_WhenOnlyHistory_RepairsToNull()
    {
        var projectId = await GetSeededProjectId();
        var versionResult = await _historyService.CreateProjectVersionAsync(
            projectId,
            new CreateVersionDto { Name = "1.0.0" }
        );
        var versionId = versionResult.Value.Id!;

        var h1 = await _historyService.CreateVersionHistoryAsync(
            versionId,
            new CreateHistoryDto { Data = "{\"tables\": []}" }
        );

        await _historyService.DeleteHistoryAsync(h1.Value.Id!);

        var version = await _context.Versions.Find(v => v.Id == versionId).FirstOrDefaultAsync();
        Assert.Null(version!.CurrentHistoryId);

        var remaining = await _context
            .Histories.Find(h => h.VersionId == versionId)
            .ToListAsync();
        Assert.Empty(remaining);
    }

    [Fact]
    public async Task Rollback_CreatesRollbackHistory_AndUpdatesCurrentHistoryId()
    {
        var projectId = await GetSeededProjectId();
        var versionResult = await _historyService.CreateProjectVersionAsync(
            projectId,
            new CreateVersionDto { Name = "1.0.0" }
        );
        var versionId = versionResult.Value.Id!;

        var historyResult = await _historyService.CreateVersionHistoryAsync(
            versionId,
            new CreateHistoryDto { Data = "{\"tables\": [\"a\"]}" }
        );

        var rollbackResult = await _historyService.RollbackVersionToHistoryAsync(
            versionId,
            historyResult.Value.Id!
        );

        Assert.True(rollbackResult.IsSuccess);

        var version = await _context.Versions.Find(v => v.Id == versionId).FirstOrDefaultAsync();
        Assert.NotNull(version!.CurrentHistoryId);
        Assert.NotEqual(historyResult.Value.Id, version.CurrentHistoryId);

        var rollbackHistory = await _context
            .Histories.Find(h => h.Id == version.CurrentHistoryId)
            .FirstOrDefaultAsync();
        Assert.NotNull(rollbackHistory);
        Assert.True(rollbackHistory.IsRollback);
        Assert.Equal("{\"tables\": [\"a\"]}", rollbackHistory.Data);
    }

    [Fact]
    public async Task Rollback_WrongVersionHistory_ReturnsNotFound()
    {
        var projectId = await GetSeededProjectId();

        var v1 = await _historyService.CreateProjectVersionAsync(
            projectId,
            new CreateVersionDto { Name = "1.0.0" }
        );
        var v2 = await _historyService.CreateProjectVersionAsync(
            projectId,
            new CreateVersionDto { Name = "2.0.0" }
        );

        var h1 = await _historyService.CreateVersionHistoryAsync(
            v1.Value.Id!,
            new CreateHistoryDto { Data = "{\"tables\": []}" }
        );

        var result = await _historyService.RollbackVersionToHistoryAsync(
            v2.Value.Id!,
            h1.Value.Id!
        );

        Assert.True(result.IsFailed);
        Assert.Contains(
            "History entry not found or does not belong to this version",
            result.Errors.Select(e => e.Message)
        );
    }
}
