using backend.Models;
using backend.Services.ProjectAuthorizationService;
using MongoDB.Bson;
using MongoDB.Driver;

namespace backend.Test.Services;

public class ProjectAuthorizationServiceTests : TestDBContext
{
    private readonly IProjectAuthorizationService _service;

    public ProjectAuthorizationServiceTests()
    {
        _service = new ProjectAuthorizationService(_mongoDbContext);
    }

    [Fact]
    public async Task CanAccessProjectAsync_And_GetAccessibleProjectsFilter_VerifyRoleResolutionAndListing()
    {
        var userId = MockUser.Id;
        var nonMemberId = ObjectId.GenerateNewId().ToString();

        var viewerProject = new Project
        {
            Name = "Viewer Project",
            Icon = "1F600",
            Members = [new Member { UserId = userId, Role = MemberRole.Viewer }],
            GeneralAccess = new GeneralAccess
            {
                AccessType = GeneralAccessType.Restricted,
                Role = MemberRole.Viewer,
            },
        };

        var editorProject = new Project
        {
            Name = "Editor Project",
            Icon = "1F600",
            Members = [new Member { UserId = userId, Role = MemberRole.Editor }],
            GeneralAccess = new GeneralAccess
            {
                AccessType = GeneralAccessType.Restricted,
                Role = MemberRole.Viewer,
            },
        };

        var adminProject = new Project
        {
            Name = "Admin Project",
            Icon = "1F600",
            Members = [new Member { UserId = userId, Role = MemberRole.Admin }],
            GeneralAccess = new GeneralAccess
            {
                AccessType = GeneralAccessType.Restricted,
                Role = MemberRole.Viewer,
            },
        };

        var ownerProject = new Project
        {
            Name = "Owner Project",
            Icon = "1F600",
            Members = [new Member { UserId = userId, Role = MemberRole.Owner }],
            GeneralAccess = new GeneralAccess
            {
                AccessType = GeneralAccessType.Restricted,
                Role = MemberRole.Viewer,
            },
        };

        var linkProject = new Project
        {
            Name = "Link Project",
            Icon = "1F600",
            Members = [],
            GeneralAccess = new GeneralAccess
            {
                AccessType = GeneralAccessType.Link,
                Role = MemberRole.Viewer,
            },
        };

        var restrictedProject = new Project
        {
            Name = "Restricted Project",
            Icon = "1F600",
            Members = [],
            GeneralAccess = new GeneralAccess
            {
                AccessType = GeneralAccessType.Restricted,
                Role = MemberRole.Viewer,
            },
        };

        await _mongoDbContext.Projects.InsertManyAsync([
            viewerProject,
            editorProject,
            adminProject,
            ownerProject,
            linkProject,
            restrictedProject,
        ]);

        var projectId = viewerProject.Id!;
        var editorProjectId = editorProject.Id!;
        var adminProjectId = adminProject.Id!;
        var ownerProjectId = ownerProject.Id!;
        var linkProjectId = linkProject.Id!;
        var restrictedProjectId = restrictedProject.Id!;

        // Exact assertions from Step 1 brief
        Assert.True(
            await _service.CanAccessProjectAsync(projectId, userId, ProjectPermission.Read)
        );
        Assert.False(
            await _service.CanAccessProjectAsync(projectId, userId, ProjectPermission.Write)
        );
        Assert.True(
            await _service.CanAccessProjectAsync(editorProjectId, userId, ProjectPermission.Write)
        );
        Assert.False(
            await _service.CanAccessProjectAsync(editorProjectId, userId, ProjectPermission.Admin)
        );
        Assert.True(
            await _service.CanAccessProjectAsync(linkProjectId, nonMemberId, ProjectPermission.Read)
        );
        Assert.False(
            await _service.CanAccessProjectAsync(
                restrictedProjectId,
                nonMemberId,
                ProjectPermission.Read
            )
        );

        // Additional role assertions for admin and owner
        Assert.True(
            await _service.CanAccessProjectAsync(adminProjectId, userId, ProjectPermission.Admin)
        );
        Assert.True(
            await _service.CanAccessProjectAsync(ownerProjectId, userId, ProjectPermission.Admin)
        );

        // Missing project check
        Assert.False(
            await _service.CanAccessProjectAsync(
                ObjectId.GenerateNewId().ToString(),
                userId,
                ProjectPermission.Read
            )
        );

        // Filter assertion
        var filter = _service.GetAccessibleProjectsFilter(userId);
        var accessibleProjects = await _mongoDbContext.Projects.Find(filter).ToListAsync();
        var accessibleIds = accessibleProjects.Select(p => p.Id).ToHashSet();

        Assert.Contains(projectId, accessibleIds);
        Assert.Contains(editorProjectId, accessibleIds);
        Assert.Contains(adminProjectId, accessibleIds);
        Assert.Contains(ownerProjectId, accessibleIds);
        Assert.Contains(linkProjectId, accessibleIds);
        Assert.DoesNotContain(restrictedProjectId, accessibleIds);
    }

    [Fact]
    public async Task MatchesUserEmailAsync_PerformsCaseInsensitiveLookupByIdAndEmail()
    {
        var validUserId = MockUser.Id;
        var validEmail = MockUser.Email;
        var nonMemberId = ObjectId.GenerateNewId().ToString();

        // Exact match
        Assert.True(await _service.MatchesUserEmailAsync(validUserId, validEmail));

        // Case-insensitive match
        Assert.True(
            await _service.MatchesUserEmailAsync(validUserId, validEmail.ToUpperInvariant())
        );

        // Mismatched email
        Assert.False(await _service.MatchesUserEmailAsync(validUserId, "wrong@example.com"));

        // Non-existent user
        Assert.False(await _service.MatchesUserEmailAsync(nonMemberId, validEmail));

        // Invalid user ID
        Assert.False(await _service.MatchesUserEmailAsync("invalid-user-id", validEmail));

        // Empty inputs
        Assert.False(await _service.MatchesUserEmailAsync("", validEmail));
        Assert.False(await _service.MatchesUserEmailAsync(validUserId, ""));
    }

    [Fact]
    public async Task CanAccessVersionAsync_And_CanAccessHistoryAsync_ResolveIndirectly()
    {
        var userId = MockUser.Id;
        var nonMemberId = ObjectId.GenerateNewId().ToString();

        var project = new Project
        {
            Name = "Versioned Project",
            Icon = "1F600",
            Members = [new Member { UserId = userId, Role = MemberRole.Viewer }],
            GeneralAccess = new GeneralAccess
            {
                AccessType = GeneralAccessType.Restricted,
                Role = MemberRole.Viewer,
            },
        };
        await _mongoDbContext.Projects.InsertOneAsync(project);

        var version = new backend.Models.Version { Name = "v1.0", ProjectId = project.Id! };
        await _mongoDbContext.Versions.InsertOneAsync(version);

        var history = new History { VersionId = version.Id!, Data = "{}" };
        await _mongoDbContext.Histories.InsertOneAsync(history);

        // Member access checks
        Assert.True(
            await _service.CanAccessVersionAsync(version.Id!, userId, ProjectPermission.Read)
        );
        Assert.False(
            await _service.CanAccessVersionAsync(version.Id!, userId, ProjectPermission.Write)
        );
        Assert.True(
            await _service.CanAccessHistoryAsync(history.Id!, userId, ProjectPermission.Read)
        );
        Assert.False(
            await _service.CanAccessHistoryAsync(history.Id!, userId, ProjectPermission.Write)
        );

        // Non-member access checks
        Assert.False(
            await _service.CanAccessVersionAsync(version.Id!, nonMemberId, ProjectPermission.Read)
        );
        Assert.False(
            await _service.CanAccessHistoryAsync(history.Id!, nonMemberId, ProjectPermission.Read)
        );

        // Missing resource checks
        var missingVersionId = ObjectId.GenerateNewId().ToString();
        var missingHistoryId = ObjectId.GenerateNewId().ToString();
        Assert.False(
            await _service.CanAccessVersionAsync(missingVersionId, userId, ProjectPermission.Read)
        );
        Assert.False(
            await _service.CanAccessHistoryAsync(missingHistoryId, userId, ProjectPermission.Read)
        );

        // Invalid ID format checks
        Assert.False(
            await _service.CanAccessVersionAsync("not-an-id", userId, ProjectPermission.Read)
        );
        Assert.False(
            await _service.CanAccessHistoryAsync("not-an-id", userId, ProjectPermission.Read)
        );

        // Dangling references (version with non-existent project, history with non-existent version)
        var danglingVersion = new backend.Models.Version
        {
            Name = "dangling",
            ProjectId = ObjectId.GenerateNewId().ToString(),
        };
        await _mongoDbContext.Versions.InsertOneAsync(danglingVersion);
        Assert.False(
            await _service.CanAccessVersionAsync(
                danglingVersion.Id!,
                userId,
                ProjectPermission.Read
            )
        );

        var danglingHistory = new History
        {
            VersionId = ObjectId.GenerateNewId().ToString(),
            Data = "{}",
        };
        await _mongoDbContext.Histories.InsertOneAsync(danglingHistory);
        Assert.False(
            await _service.CanAccessHistoryAsync(
                danglingHistory.Id!,
                userId,
                ProjectPermission.Read
            )
        );
    }

    [Fact]
    public async Task CanAccessProjectAsync_LinkAccessAndExplicitRolePrecedence()
    {
        var memberId = ObjectId.GenerateNewId().ToString();
        var nonMemberId = ObjectId.GenerateNewId().ToString();

        // Project with Link access granting Editor, but memberId is explicit Viewer
        var linkEditorProject = new Project
        {
            Name = "Link Editor Project",
            Icon = "1F600",
            Members = [new Member { UserId = memberId, Role = MemberRole.Viewer }],
            GeneralAccess = new GeneralAccess
            {
                AccessType = GeneralAccessType.Link,
                Role = MemberRole.Editor,
            },
        };
        await _mongoDbContext.Projects.InsertOneAsync(linkEditorProject);

        var projectId = linkEditorProject.Id!;

        // Non-member gets Editor permission via Link access
        Assert.True(
            await _service.CanAccessProjectAsync(projectId, nonMemberId, ProjectPermission.Read)
        );
        Assert.True(
            await _service.CanAccessProjectAsync(projectId, nonMemberId, ProjectPermission.Write)
        );
        Assert.False(
            await _service.CanAccessProjectAsync(projectId, nonMemberId, ProjectPermission.Admin)
        );

        // Explicit member gets Viewer permission (explicit role takes precedence over link)
        Assert.True(
            await _service.CanAccessProjectAsync(projectId, memberId, ProjectPermission.Read)
        );
        Assert.False(
            await _service.CanAccessProjectAsync(projectId, memberId, ProjectPermission.Write)
        );

        // Inaccessible restricted project for non-member
        var restrictedProject = new Project
        {
            Name = "Restricted Project 2",
            Icon = "1F600",
            Members = [],
            GeneralAccess = new GeneralAccess
            {
                AccessType = GeneralAccessType.Restricted,
                Role = MemberRole.Editor,
            },
        };
        await _mongoDbContext.Projects.InsertOneAsync(restrictedProject);
        Assert.False(
            await _service.CanAccessProjectAsync(
                restrictedProject.Id!,
                nonMemberId,
                ProjectPermission.Read
            )
        );
        Assert.False(
            await _service.CanAccessProjectAsync(
                restrictedProject.Id!,
                nonMemberId,
                ProjectPermission.Write
            )
        );

        // Invalid filter user ID returns safe filter matching link projects
        var invalidFilter = _service.GetAccessibleProjectsFilter("invalid-id");
        var matchedProjects = await _mongoDbContext.Projects.Find(invalidFilter).ToListAsync();
        Assert.Contains(matchedProjects, p => p.Id == projectId);
        Assert.DoesNotContain(matchedProjects, p => p.Id == restrictedProject.Id);
    }
}
