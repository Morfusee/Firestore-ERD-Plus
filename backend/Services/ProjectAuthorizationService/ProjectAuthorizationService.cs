using backend.Common.Attributes;
using backend.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace backend.Services.ProjectAuthorizationService;

[ScopedService]
public class ProjectAuthorizationService(MongoDbContext context) : IProjectAuthorizationService
{
    private readonly MongoDbContext _context = context;

    private static bool Allows(MemberRole role, ProjectPermission permission) =>
        permission switch
        {
            ProjectPermission.Read => true,
            ProjectPermission.Write => role
                is MemberRole.Editor
                    or MemberRole.Admin
                    or MemberRole.Owner,
            ProjectPermission.Admin => role is MemberRole.Admin or MemberRole.Owner,
            _ => false,
        };

    public async Task<bool> MatchesUserEmailAsync(string userId, string email)
    {
        if (!ObjectId.TryParse(userId, out _) || string.IsNullOrWhiteSpace(email))
        {
            return false;
        }

        var user = await _context
            .Users.Find(u =>
                u.Id == userId && u.Email.Equals(email, StringComparison.OrdinalIgnoreCase)
            )
            .FirstOrDefaultAsync();

        return user != null;
    }

    public async Task<bool> CanAccessProjectAsync(
        string projectId,
        string userId,
        ProjectPermission permission
    )
    {
        if (!ObjectId.TryParse(projectId, out _) || !ObjectId.TryParse(userId, out _))
        {
            return false;
        }

        var project = await _context.Projects.Find(p => p.Id == projectId).FirstOrDefaultAsync();

        if (project == null)
        {
            return false;
        }

        var member = project.Members.FirstOrDefault(m => m.UserId == userId);
        if (member != null)
        {
            return Allows(member.Role, permission);
        }

        if (project.GeneralAccess?.AccessType == GeneralAccessType.Link)
        {
            return Allows(project.GeneralAccess.Role, permission);
        }

        return false;
    }

    public async Task<bool> CanAccessVersionAsync(
        string versionId,
        string userId,
        ProjectPermission permission
    )
    {
        if (!ObjectId.TryParse(versionId, out _))
        {
            return false;
        }

        var version = await _context.Versions.Find(v => v.Id == versionId).FirstOrDefaultAsync();

        if (version == null || string.IsNullOrEmpty(version.ProjectId))
        {
            return false;
        }

        return await CanAccessProjectAsync(version.ProjectId, userId, permission);
    }

    public async Task<bool> CanAccessHistoryAsync(
        string historyId,
        string userId,
        ProjectPermission permission
    )
    {
        if (!ObjectId.TryParse(historyId, out _))
        {
            return false;
        }

        var history = await _context.Histories.Find(h => h.Id == historyId).FirstOrDefaultAsync();

        if (history == null || string.IsNullOrEmpty(history.VersionId))
        {
            return false;
        }

        return await CanAccessVersionAsync(history.VersionId, userId, permission);
    }

    public FilterDefinition<Project> GetAccessibleProjectsFilter(string userId)
    {
        if (!ObjectId.TryParse(userId, out _))
        {
            return Builders<Project>.Filter.Eq(
                p => p.GeneralAccess.AccessType,
                GeneralAccessType.Link
            );
        }

        return Builders<Project>.Filter.Or(
            Builders<Project>.Filter.ElemMatch(p => p.Members, m => m.UserId == userId),
            Builders<Project>.Filter.Eq(p => p.GeneralAccess.AccessType, GeneralAccessType.Link)
        );
    }
}
