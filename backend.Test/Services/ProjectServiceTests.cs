using backend.DTOs.Common;
using backend.DTOs.Project;
using backend.Mappers;
using backend.Models;
using backend.Services;
using backend.Services.EmojiService;
using backend.Services.ProjectService;
using MongoDB.Driver;

namespace backend.Test.Services;

public class ProjectServiceTests : TestDBContext
{
    private readonly MongoDbContext _context;
    private readonly ProjectMapper _mapper;
    private readonly IEmojiService _emojiService;
    private readonly IProjectService _projectService;

    public ProjectServiceTests()
    {
        _context = _mongoDbContext;

        // Setup real mapper and mock emoji service
        _mapper = new ProjectMapper();
        _emojiService = new EmojiService(_context, _emojiMapper);
        _projectService = new ProjectService(_context, _mapper, _emojiService);
    }

    [Fact]
    public async Task CreateProjectAsync_WithValidData_ReturnsSuccessResult()
    {
        // Arrange
        var createDto = new CreateProjectDto
        {
            Name = "Test Project",
            Icon = "1F600",
            Email = MockUser.Email,
        };

        var emoji = "😀";

        // Act
        var result = await _projectService.CreateProjectAsync(createDto);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(createDto.Name, result.Value.Name);
        Assert.Equal(emoji, result.Value.Icon);
        Assert.NotNull(result.Value.Id);

        // Verify project was inserted into database
        var savedProject = await _context
            .Projects.Find(p => p.Id == result.Value.Id)
            .FirstOrDefaultAsync();
        Assert.NotNull(savedProject);
        Assert.Equal(createDto.Name, savedProject.Name);
        Assert.Single(savedProject.Members);
        Assert.Equal(MockUser.Id, savedProject.Members[0].UserId);
        Assert.Equal(MemberRole.Owner, savedProject.Members[0].Role);
    }

    [Fact]
    public async Task CreateProjectAsync_WithInvalidEmoji_ReturnsFailure()
    {
        // Arrange
        var createDto = new CreateProjectDto
        {
            Name = "Test Project",
            Icon = "INVALID",
            Email = MockUser.Email,
        };

        // Act
        var result = await _projectService.CreateProjectAsync(createDto);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Contains("Invalid emoji icon", result.Errors.Select(e => e.Message));

        // Verify project was not inserted
        var project = await _context
            .Projects.Find(p => p.Name == createDto.Name)
            .FirstOrDefaultAsync();
        Assert.Null(project);
    }

    [Fact]
    public async Task CreateProjectAsync_WithNonExistentUser_ReturnsFailure()
    {
        // Arrange
        var createDto = new CreateProjectDto
        {
            Name = "Test Project",
            Icon = "1F600",
            Email = "nonexistent@example.com",
        };

        // Act
        var result = await _projectService.CreateProjectAsync(createDto);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Contains("User not found", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task GetProjectByIdAsync_WithExistingProject_ReturnsProject()
    {
        // Arrange
        var createDto = new CreateProjectDto
        {
            Name = "Test Project",
            Icon = "1F600",
            Email = MockUser.Email,
        };
        var createResult = await _projectService.CreateProjectAsync(createDto);

        var emoji = "😀";

        // Act
        var result = await _projectService.GetProjectByIdAsync(createResult.Value.Id!);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(createResult.Value.Id, result.Value.Id);
        Assert.Equal(createResult.Value.Name, result.Value.Name);
        Assert.Equal(emoji, result.Value.Icon);
    }

    [Fact]
    public async Task GetProjectByIdAsync_WithNonExistentProject_ReturnsFailure()
    {
        // Arrange
        var nonExistentId = "507f1f77bcf86cd799439012";

        // Act
        var result = await _projectService.GetProjectByIdAsync(nonExistentId);

        // Assert
        Assert.True(result.IsFailed);
        Assert.Contains("Project not found", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task UpdateProjectAsync_WithValidData_ReturnsUpdatedProject()
    {
        // Arrange
        var createDto = new CreateProjectDto
        {
            Name = "Original Project Name",
            Icon = "1F600",
            Email = MockUser.Email,
        };
        var createResult = await _projectService.CreateProjectAsync(createDto);

        var updateDto = new UpdateProjectDto
        {
            Id = createResult.Value.Id!,
            Name = "Updated Project Name",
            Icon = "1F601",
        };
        var emoji = "😁";

        // Act
        var result = await _projectService.UpdateProjectAsync(updateDto);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(updateDto.Name, result.Value.Name);
        Assert.Equal(emoji, result.Value.Icon);

        // Verify database was updated
        var updatedProject = await _context
            .Projects.Find(p => p.Id == createResult.Value.Id)
            .FirstOrDefaultAsync();
        Assert.Equal(updateDto.Name, updatedProject.Name);
        Assert.Equal(updateDto.Icon, updatedProject.Icon);
    }

    [Fact]
    public async Task UpdateProjectAsync_WithNonExistentProject_ReturnsFailure()
    {
        // Arrange
        var updateDto = new UpdateProjectDto
        {
            Id = "507f1f77bcf86cd799439012",
            Name = "Updated Project Name",
        };

        // Act
        var result = await _projectService.UpdateProjectAsync(updateDto);

        // Assert
        Assert.True(result.IsFailed);
        Assert.Contains("Project not found", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task SaveProjectAsync_WithValidData_ReturnsSavedProject()
    {
        // Arrange
        var createDto = new CreateProjectDto
        {
            Name = "Test Project",
            Icon = "1F600",
            Email = MockUser.Email,
        };

        var createResult = await _projectService.CreateProjectAsync(createDto);

        var saveDto = new SaveProjectDto
        {
            Id = createResult.Value.Id!,
            Data = "{\"tables\": [], \"relations\": []}",
        };

        // Act
        var result = await _projectService.SaveProjectAsync(saveDto);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(saveDto.Data, result.Value.Data);

        // Verify database was updated
        var savedProject = await _context
            .Projects.Find(p => p.Id == createResult.Value.Id)
            .FirstOrDefaultAsync();
        Assert.Equal(saveDto.Data, savedProject.Data);
    }

    [Fact]
    public async Task SaveProjectAsync_WithNonExistentProject_ReturnsFailure()
    {
        // Arrange
        var saveDto = new SaveProjectDto
        {
            Id = "507f1f77bcf86cd799439012",
            Data = "{\"tables\": [], \"relations\": []}",
        };

        // Act
        var result = await _projectService.SaveProjectAsync(saveDto);

        // Assert
        Assert.True(result.IsFailed);
        Assert.Contains("Project not found", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task DeleteProjectAsync_WithExistingProject_ReturnsSuccess()
    {
        // Arrange
        var createDto = new CreateProjectDto
        {
            Name = "Test Project",
            Icon = "1F600",
            Email = MockUser.Email,
        };
        var createResult = await _projectService.CreateProjectAsync(createDto);

        // Act
        var result = await _projectService.DeleteProjectAsync(createResult.Value.Id!);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.True(result.Value);

        // Verify project was deleted
        var deletedProject = await _context
            .Projects.Find(p => p.Id == createResult.Value.Id)
            .FirstOrDefaultAsync();
        Assert.Null(deletedProject);
    }

    [Fact]
    public async Task GetAllProjectsAsync_WithPagination_ReturnsPaginatedProjects()
    {
        // Arrange
        var createDtos = new List<CreateProjectDto>
        {
            new()
            {
                Name = "Project 1",
                Icon = "1F600",
                Email = MockUser.Email,
            },
            new()
            {
                Name = "Project 2",
                Icon = "1F601",
                Email = MockUser.Email,
            },
            new()
            {
                Name = "Project 3",
                Icon = "1F680",
                Email = MockUser.Email,
            },
        };
        foreach (var dto in createDtos)
        {
            await _projectService.CreateProjectAsync(dto);
        }

        var pagination = new PaginationDto { Page = 1, Limit = 2 };

        // Act
        var result = await _projectService.GetAllProjectsAsync(pagination);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.True(result.Value.TotalCount >= 3);
        Assert.True(result.Value.TotalPages >= 2);

        // Verify if one of the projects are inserted correctly
        var project = await _context
            .Projects.Find(p => p.Name == createDtos[0].Name)
            .FirstOrDefaultAsync();
        Assert.NotNull(project);
        Assert.Equal(createDtos[0].Name, project.Name);
    }

    [Fact]
    public async Task GetProjectsByEmailAsync_WithExistingUser_ReturnsUserProjects()
    {
        // Arrange
        var emailDto = new EmailDto { Email = MockUser.Email };
        var pagination = new PaginationDto { Page = 1, Limit = 10 };

        // Act
        var result = await _projectService.GetProjectsByEmailAsync(emailDto, pagination);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.True(result.Value.TotalCount >= 2);
        Assert.True(result.Value.Items.Count() >= 2);
        Assert.NotNull(result.Value);
    }

    [Fact]
    public async Task GetProjectsByEmailAsync_WithNoProjects()
    {
        // Arrange
        var emailDto = new EmailDto { Email = "noprojects@example.com" };
        var pagination = new PaginationDto { Page = 1, Limit = 10 };

        // Act
        var result = await _projectService.GetProjectsByEmailAsync(emailDto, pagination);

        // Assert
        Assert.True(result.IsFailed);
        Assert.Contains("User not found", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task DeleteProjectAsync_WithNonExistentProject_ReturnsSuccess()
    {
        var result = await _projectService.DeleteProjectAsync("507f1f77bcf86cd799439012");

        Assert.True(result.IsSuccess);
        Assert.True(result.Value);
    }

    [Fact]
    public async Task UpdateProjectAsync_WithOnlyName_PreservesIconAndData()
    {
        var project = await _context.Projects.Find(_ => true).FirstOrDefaultAsync();
        await _context.Projects.UpdateOneAsync(
            p => p.Id == project!.Id,
            Builders<Project>.Update.Set(p => p.Data, "{\"tables\":[]}")
        );

        var result = await _projectService.UpdateProjectAsync(
            new UpdateProjectDto { Id = project!.Id!, Name = "Renamed" }
        );

        Assert.True(result.IsSuccess);
        Assert.Equal("Renamed", result.Value.Name);
        Assert.Equal(
            project.Icon,
            (await _context.Projects.Find(p => p.Id == project.Id).SingleAsync()).Icon
        );
        Assert.Equal("{\"tables\":[]}", result.Value.Data);
    }
}
