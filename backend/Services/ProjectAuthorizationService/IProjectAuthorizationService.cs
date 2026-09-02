namespace backend.Services.ProjectAuthorizationService;

public enum ProjectPermission
{
    Read,
    Write,
    Admin,
}

public interface IProjectAuthorizationService
{
    Task<bool> MatchesUserEmailAsync(string userId, string email);
    Task<bool> CanAccessProjectAsync(string projectId, string userId, ProjectPermission permission);
    Task<bool> CanAccessVersionAsync(string versionId, string userId, ProjectPermission permission);
    Task<bool> CanAccessHistoryAsync(string historyId, string userId, ProjectPermission permission);
    MongoDB.Driver.FilterDefinition<backend.Models.Project> GetAccessibleProjectsFilter(
        string userId
    );
}
