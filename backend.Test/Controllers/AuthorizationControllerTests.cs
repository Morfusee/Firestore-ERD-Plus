using System.Security.Claims;
using backend.Common.Models;
using backend.Controllers;
using backend.DTOs.Common;
using backend.DTOs.History;
using backend.DTOs.Project;
using backend.Models;
using backend.Services.HistoryService;
using backend.Services.ProjectAuthorizationService;
using backend.Services.ProjectService;
using FluentResults;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Moq;
using Xunit;

namespace backend.Test.Controllers;

public class AuthorizationControllerTests
{
    private const string UserId = "507f1f77bcf86cd799439011";
    private readonly Mock<IProjectService> _projectService = new();
    private readonly Mock<IProjectAuthorizationService> _authorizationService = new();
    private readonly Mock<IHistoryService> _historyService = new();

    private ProjectController CreateController(string userId = UserId)
    {
        return new ProjectController(_projectService.Object, _authorizationService.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(
                        new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, userId)], "TestAuth")
                    ),
                },
            },
        };
    }

    private HistoryController CreateHistoryController(string userId = UserId)
    {
        return new HistoryController(_historyService.Object, _authorizationService.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(
                        new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, userId)], "TestAuth")
                    ),
                },
            },
        };
    }

    [Fact]
    public async Task GetProjectById_WhenAccessDenied_ReturnsNotFoundAndDoesNotCallService()
    {
        const string projectId = "507f1f77bcf86cd799439012";
        _authorizationService
            .Setup(a => a.CanAccessProjectAsync(projectId, UserId, ProjectPermission.Read))
            .ReturnsAsync(false);

        var controller = CreateController();
        var action = await controller.GetProjectById(projectId);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status404NotFound, result.StatusCode);
        _projectService.Verify(s => s.GetProjectByIdAsync(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task GetProjectById_WhenAccessAllowed_CallsServiceAndReturnsResult()
    {
        const string projectId = "507f1f77bcf86cd799439012";
        var projectDto = new ProjectResponseDto { Id = projectId, Name = "Test Project", Icon = "1F600" };
        _authorizationService
            .Setup(a => a.CanAccessProjectAsync(projectId, UserId, ProjectPermission.Read))
            .ReturnsAsync(true);
        _projectService
            .Setup(s => s.GetProjectByIdAsync(projectId))
            .ReturnsAsync(Result.Ok(projectDto));

        var controller = CreateController();
        var action = await controller.GetProjectById(projectId);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status200OK, result.StatusCode);
        _projectService.Verify(s => s.GetProjectByIdAsync(projectId), Times.Once);
    }

    [Fact]
    public async Task SaveProject_WhenWriteDenied_ReturnsNotFoundAndDoesNotCallService()
    {
        const string projectId = "507f1f77bcf86cd799439012";
        var dto = new SaveProjectDto { Id = projectId, Data = "{}" };
        _authorizationService
            .Setup(a => a.CanAccessProjectAsync(projectId, UserId, ProjectPermission.Write))
            .ReturnsAsync(false);

        var controller = CreateController();
        var action = await controller.SaveProject(dto);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status404NotFound, result.StatusCode);
        _projectService.Verify(s => s.SaveProjectAsync(It.IsAny<SaveProjectDto>()), Times.Never);
    }

    [Fact]
    public async Task SaveProject_WhenWriteAllowed_CallsServiceAndReturnsResult()
    {
        const string projectId = "507f1f77bcf86cd799439012";
        var dto = new SaveProjectDto { Id = projectId, Data = "{}" };
        var projectDto = new ProjectResponseDto { Id = projectId, Name = "Test Project", Icon = "1F600" };
        _authorizationService
            .Setup(a => a.CanAccessProjectAsync(projectId, UserId, ProjectPermission.Write))
            .ReturnsAsync(true);
        _projectService
            .Setup(s => s.SaveProjectAsync(dto))
            .ReturnsAsync(Result.Ok(projectDto));

        var controller = CreateController();
        var action = await controller.SaveProject(dto);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status200OK, result.StatusCode);
        _projectService.Verify(s => s.SaveProjectAsync(dto), Times.Once);
    }

    [Fact]
    public async Task UpdateProject_WhenAdminDenied_ReturnsNotFoundAndDoesNotCallService()
    {
        const string projectId = "507f1f77bcf86cd799439012";
        var dto = new UpdateProjectDto { Id = projectId, Name = "Updated" };
        _authorizationService
            .Setup(a => a.CanAccessProjectAsync(projectId, UserId, ProjectPermission.Admin))
            .ReturnsAsync(false);

        var controller = CreateController();
        var action = await controller.UpdateProject(dto);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status404NotFound, result.StatusCode);
        _projectService.Verify(s => s.UpdateProjectAsync(It.IsAny<UpdateProjectDto>()), Times.Never);
    }

    [Fact]
    public async Task UpdateProject_WhenAdminAllowed_CallsServiceAndReturnsResult()
    {
        const string projectId = "507f1f77bcf86cd799439012";
        var dto = new UpdateProjectDto { Id = projectId, Name = "Updated" };
        var projectDto = new ProjectResponseDto { Id = projectId, Name = "Updated", Icon = "1F600" };
        _authorizationService
            .Setup(a => a.CanAccessProjectAsync(projectId, UserId, ProjectPermission.Admin))
            .ReturnsAsync(true);
        _projectService
            .Setup(s => s.UpdateProjectAsync(dto))
            .ReturnsAsync(Result.Ok(projectDto));

        var controller = CreateController();
        var action = await controller.UpdateProject(dto);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status200OK, result.StatusCode);
        _projectService.Verify(s => s.UpdateProjectAsync(dto), Times.Once);
    }

    [Fact]
    public async Task DeleteProject_WhenAdminDenied_ReturnsNotFoundAndDoesNotCallService()
    {
        const string projectId = "507f1f77bcf86cd799439012";
        _authorizationService
            .Setup(a => a.CanAccessProjectAsync(projectId, UserId, ProjectPermission.Admin))
            .ReturnsAsync(false);

        var controller = CreateController();
        var action = await controller.DeleteProject(projectId);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status404NotFound, result.StatusCode);
        _projectService.Verify(s => s.DeleteProjectAsync(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task DeleteProject_WhenAdminAllowed_CallsServiceAndReturnsResult()
    {
        const string projectId = "507f1f77bcf86cd799439012";
        _authorizationService
            .Setup(a => a.CanAccessProjectAsync(projectId, UserId, ProjectPermission.Admin))
            .ReturnsAsync(true);
        _projectService
            .Setup(s => s.DeleteProjectAsync(projectId))
            .ReturnsAsync(Result.Ok(true));

        var controller = CreateController();
        var action = await controller.DeleteProject(projectId);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status200OK, result.StatusCode);
        _projectService.Verify(s => s.DeleteProjectAsync(projectId), Times.Once);
    }

    [Fact]
    public async Task CreateProject_WhenEmailDoesNotMatchUser_ReturnsNotFoundAndDoesNotCallService()
    {
        var dto = new CreateProjectDto
        {
            Email = "other@example.com",
            Name = "New Project",
            Icon = "1F600",
        };
        _authorizationService
            .Setup(a => a.MatchesUserEmailAsync(UserId, dto.Email))
            .ReturnsAsync(false);

        var controller = CreateController();
        var action = await controller.CreateProject(dto);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status404NotFound, result.StatusCode);
        _projectService.Verify(s => s.CreateProjectAsync(It.IsAny<CreateProjectDto>()), Times.Never);
    }

    [Fact]
    public async Task CreateProject_WhenEmailMatchesUser_CallsServiceAndReturnsResult()
    {
        var dto = new CreateProjectDto
        {
            Email = "user@example.com",
            Name = "New Project",
            Icon = "1F600",
        };
        var projectDto = new ProjectResponseDto { Id = "507f1f77bcf86cd799439012", Name = "New Project", Icon = "1F600" };
        _authorizationService
            .Setup(a => a.MatchesUserEmailAsync(UserId, dto.Email))
            .ReturnsAsync(true);
        _projectService
            .Setup(s => s.CreateProjectAsync(dto))
            .ReturnsAsync(Result.Ok(projectDto));

        var controller = CreateController();
        var action = await controller.CreateProject(dto);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status200OK, result.StatusCode);
        _projectService.Verify(s => s.CreateProjectAsync(dto), Times.Once);
    }

    [Fact]
    public async Task GetProjectsByEmail_WhenEmailDoesNotMatchUser_ReturnsNotFoundAndDoesNotCallService()
    {
        var emailDto = new EmailDto { Email = "other@example.com" };
        var pagination = new PaginationDto();
        _authorizationService
            .Setup(a => a.MatchesUserEmailAsync(UserId, emailDto.Email))
            .ReturnsAsync(false);

        var controller = CreateController();
        var action = await controller.GetProjectsByEmail(emailDto, pagination);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status404NotFound, result.StatusCode);
        _projectService.Verify(s => s.GetProjectsByEmailAsync(It.IsAny<EmailDto>(), It.IsAny<PaginationDto>()), Times.Never);
    }

    [Fact]
    public async Task GetProjectsByEmail_WhenEmailMatchesUser_CallsServiceAndReturnsResult()
    {
        var emailDto = new EmailDto { Email = "user@example.com" };
        var pagination = new PaginationDto();
        var paginatedResponse = new PaginatedResponseDto<ProjectResponseDto>
        {
            Items = [],
            TotalCount = 0,
            Page = 1,
            Limit = 10,
        };
        _authorizationService
            .Setup(a => a.MatchesUserEmailAsync(UserId, emailDto.Email))
            .ReturnsAsync(true);
        _projectService
            .Setup(s => s.GetProjectsByEmailAsync(emailDto, pagination))
            .ReturnsAsync(Result.Ok(paginatedResponse));

        var controller = CreateController();
        var action = await controller.GetProjectsByEmail(emailDto, pagination);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status200OK, result.StatusCode);
        _projectService.Verify(s => s.GetProjectsByEmailAsync(emailDto, pagination), Times.Once);
    }

    [Fact]
    public async Task GetAllProjects_PassesAccessibleProjectsFilterToService()
    {
        var pagination = new PaginationDto();
        var filter = Builders<Project>.Filter.Eq(p => p.Id, "507f1f77bcf86cd799439012");
        var paginatedResponse = new PaginatedResponseDto<ProjectResponseDto>
        {
            Items = [],
            TotalCount = 0,
            Page = 1,
            Limit = 10,
        };
        _authorizationService
            .Setup(a => a.GetAccessibleProjectsFilter(UserId))
            .Returns(filter);
        _projectService
            .Setup(s => s.GetAllProjectsAsync(pagination, filter))
            .ReturnsAsync(Result.Ok(paginatedResponse));

        var controller = CreateController();
        var action = await controller.GetAllProjects(pagination);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status200OK, result.StatusCode);
        _projectService.Verify(s => s.GetAllProjectsAsync(pagination, filter), Times.Once);
    }

    [Fact]
    public async Task GetProjectVersions_WhenReadDenied_ReturnsNotFoundAndDoesNotCallService()
    {
        const string projectId = "507f1f77bcf86cd799439012";
        _authorizationService
            .Setup(a => a.CanAccessProjectAsync(projectId, UserId, ProjectPermission.Read))
            .ReturnsAsync(false);

        var controller = CreateHistoryController();
        var action = await controller.GetProjectVersions(projectId, new PaginationDto());

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status404NotFound, result.StatusCode);
        _historyService.Verify(
            s => s.GetProjectVersionsAsync(It.IsAny<string>(), It.IsAny<PaginationDto>()),
            Times.Never
        );
    }

    [Fact]
    public async Task GetProjectVersions_WhenReadAllowed_CallsServiceAndReturnsResult()
    {
        const string projectId = "507f1f77bcf86cd799439012";
        var pagination = new PaginationDto();
        var response = new PaginatedResponseDto<VersionResponseDto>
        {
            Items = [],
            TotalCount = 0,
            Page = 1,
            Limit = 10,
        };
        _authorizationService
            .Setup(a => a.CanAccessProjectAsync(projectId, UserId, ProjectPermission.Read))
            .ReturnsAsync(true);
        _historyService
            .Setup(s => s.GetProjectVersionsAsync(projectId, pagination))
            .ReturnsAsync(Result.Ok(response));

        var controller = CreateHistoryController();
        var action = await controller.GetProjectVersions(projectId, pagination);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status200OK, result.StatusCode);
        _historyService.Verify(s => s.GetProjectVersionsAsync(projectId, pagination), Times.Once);
    }

    [Fact]
    public async Task CreateProjectVersion_WhenWriteDenied_ReturnsNotFoundAndDoesNotCallService()
    {
        const string projectId = "507f1f77bcf86cd799439012";
        var dto = new CreateVersionDto { Name = "v1" };
        _authorizationService
            .Setup(a => a.CanAccessProjectAsync(projectId, UserId, ProjectPermission.Write))
            .ReturnsAsync(false);

        var controller = CreateHistoryController();
        var action = await controller.CreateProjectVersion(projectId, dto);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status404NotFound, result.StatusCode);
        _historyService.Verify(
            s => s.CreateProjectVersionAsync(It.IsAny<string>(), It.IsAny<CreateVersionDto>()),
            Times.Never
        );
    }

    [Fact]
    public async Task CreateProjectVersion_WhenWriteAllowed_CallsServiceAndReturnsResult()
    {
        const string projectId = "507f1f77bcf86cd799439012";
        var dto = new CreateVersionDto { Name = "v1" };
        var versionDto = new VersionResponseDto { Id = "507f1f77bcf86cd799439013", ProjectId = projectId };
        _authorizationService
            .Setup(a => a.CanAccessProjectAsync(projectId, UserId, ProjectPermission.Write))
            .ReturnsAsync(true);
        _historyService
            .Setup(s => s.CreateProjectVersionAsync(projectId, dto))
            .ReturnsAsync(Result.Ok(versionDto));

        var controller = CreateHistoryController();
        var action = await controller.CreateProjectVersion(projectId, dto);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status200OK, result.StatusCode);
        _historyService.Verify(s => s.CreateProjectVersionAsync(projectId, dto), Times.Once);
    }

    [Fact]
    public async Task GetVersionById_WhenReadDenied_ReturnsNotFoundAndDoesNotCallService()
    {
        const string versionId = "507f1f77bcf86cd799439013";
        _authorizationService
            .Setup(a => a.CanAccessVersionAsync(versionId, UserId, ProjectPermission.Read))
            .ReturnsAsync(false);

        var controller = CreateHistoryController();
        var action = await controller.GetVersionById(versionId, null);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status404NotFound, result.StatusCode);
        _historyService.Verify(
            s => s.GetVersionByIdAsync(It.IsAny<string>(), It.IsAny<string?>()),
            Times.Never
        );
    }

    [Fact]
    public async Task GetVersionById_WhenReadAllowed_CallsServiceAndReturnsResult()
    {
        const string versionId = "507f1f77bcf86cd799439013";
        var versionDto = new VersionResponseDto { Id = versionId };
        _authorizationService
            .Setup(a => a.CanAccessVersionAsync(versionId, UserId, ProjectPermission.Read))
            .ReturnsAsync(true);
        _historyService
            .Setup(s => s.GetVersionByIdAsync(versionId, null))
            .ReturnsAsync(Result.Ok(versionDto));

        var controller = CreateHistoryController();
        var action = await controller.GetVersionById(versionId, null);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status200OK, result.StatusCode);
        _historyService.Verify(s => s.GetVersionByIdAsync(versionId, null), Times.Once);
    }

    [Fact]
    public async Task UpdateVersion_WhenWriteDenied_ReturnsNotFoundAndDoesNotCallService()
    {
        const string versionId = "507f1f77bcf86cd799439013";
        var dto = new UpdateVersionDto { Name = "v2" };
        _authorizationService
            .Setup(a => a.CanAccessVersionAsync(versionId, UserId, ProjectPermission.Write))
            .ReturnsAsync(false);

        var controller = CreateHistoryController();
        var action = await controller.UpdateVersion(versionId, dto);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status404NotFound, result.StatusCode);
        _historyService.Verify(
            s => s.UpdateVersionAsync(It.IsAny<string>(), It.IsAny<UpdateVersionDto>()),
            Times.Never
        );
    }

    [Fact]
    public async Task UpdateVersion_WhenWriteAllowed_CallsServiceAndReturnsResult()
    {
        const string versionId = "507f1f77bcf86cd799439013";
        var dto = new UpdateVersionDto { Name = "v2" };
        var versionDto = new VersionResponseDto { Id = versionId };
        _authorizationService
            .Setup(a => a.CanAccessVersionAsync(versionId, UserId, ProjectPermission.Write))
            .ReturnsAsync(true);
        _historyService
            .Setup(s => s.UpdateVersionAsync(versionId, dto))
            .ReturnsAsync(Result.Ok(versionDto));

        var controller = CreateHistoryController();
        var action = await controller.UpdateVersion(versionId, dto);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status200OK, result.StatusCode);
        _historyService.Verify(s => s.UpdateVersionAsync(versionId, dto), Times.Once);
    }

    [Fact]
    public async Task DeleteVersion_WhenAdminDenied_ReturnsNotFoundAndDoesNotCallService()
    {
        const string versionId = "507f1f77bcf86cd799439013";
        _authorizationService
            .Setup(a => a.CanAccessVersionAsync(versionId, UserId, ProjectPermission.Admin))
            .ReturnsAsync(false);

        var controller = CreateHistoryController();
        var action = await controller.DeleteVersion(versionId);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status404NotFound, result.StatusCode);
        _historyService.Verify(s => s.DeleteVersionAsync(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task DeleteVersion_WhenAdminAllowed_CallsServiceAndReturnsResult()
    {
        const string versionId = "507f1f77bcf86cd799439013";
        _authorizationService
            .Setup(a => a.CanAccessVersionAsync(versionId, UserId, ProjectPermission.Admin))
            .ReturnsAsync(true);
        _historyService
            .Setup(s => s.DeleteVersionAsync(versionId))
            .ReturnsAsync(Result.Ok(true));

        var controller = CreateHistoryController();
        var action = await controller.DeleteVersion(versionId);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status200OK, result.StatusCode);
        _historyService.Verify(s => s.DeleteVersionAsync(versionId), Times.Once);
    }

    [Fact]
    public async Task GetVersionHistories_WhenReadDenied_ReturnsNotFoundAndDoesNotCallService()
    {
        const string versionId = "507f1f77bcf86cd799439013";
        _authorizationService
            .Setup(a => a.CanAccessVersionAsync(versionId, UserId, ProjectPermission.Read))
            .ReturnsAsync(false);

        var controller = CreateHistoryController();
        var action = await controller.GetVersionHistories(versionId, new PaginationDto());

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status404NotFound, result.StatusCode);
        _historyService.Verify(
            s => s.GetVersionHistoriesAsync(It.IsAny<string>(), It.IsAny<PaginationDto>()),
            Times.Never
        );
    }

    [Fact]
    public async Task GetVersionHistories_WhenReadAllowed_CallsServiceAndReturnsResult()
    {
        const string versionId = "507f1f77bcf86cd799439013";
        var pagination = new PaginationDto();
        var response = new PaginatedResponseDto<HistoryResponseDto>
        {
            Items = [],
            TotalCount = 0,
            Page = 1,
            Limit = 10,
        };
        _authorizationService
            .Setup(a => a.CanAccessVersionAsync(versionId, UserId, ProjectPermission.Read))
            .ReturnsAsync(true);
        _historyService
            .Setup(s => s.GetVersionHistoriesAsync(versionId, pagination))
            .ReturnsAsync(Result.Ok(response));

        var controller = CreateHistoryController();
        var action = await controller.GetVersionHistories(versionId, pagination);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status200OK, result.StatusCode);
        _historyService.Verify(s => s.GetVersionHistoriesAsync(versionId, pagination), Times.Once);
    }

    [Fact]
    public async Task CreateVersionHistory_WhenWriteDenied_ReturnsNotFoundAndDoesNotCallService()
    {
        const string versionId = "507f1f77bcf86cd799439013";
        var dto = new CreateHistoryDto { Data = "{}" };
        _authorizationService
            .Setup(a => a.CanAccessVersionAsync(versionId, UserId, ProjectPermission.Write))
            .ReturnsAsync(false);

        var controller = CreateHistoryController();
        var action = await controller.CreateVersionHistory(versionId, dto);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status404NotFound, result.StatusCode);
        _historyService.Verify(
            s => s.CreateVersionHistoryAsync(It.IsAny<string>(), It.IsAny<CreateHistoryDto>()),
            Times.Never
        );
    }

    [Fact]
    public async Task CreateVersionHistory_WhenWriteAllowed_CallsServiceAndReturnsResult()
    {
        const string versionId = "507f1f77bcf86cd799439013";
        var dto = new CreateHistoryDto { Data = "{}" };
        var historyDto = new HistoryResponseDto { Id = "507f1f77bcf86cd799439014", VersionId = versionId };
        _authorizationService
            .Setup(a => a.CanAccessVersionAsync(versionId, UserId, ProjectPermission.Write))
            .ReturnsAsync(true);
        _historyService
            .Setup(s => s.CreateVersionHistoryAsync(versionId, dto))
            .ReturnsAsync(Result.Ok(historyDto));

        var controller = CreateHistoryController();
        var action = await controller.CreateVersionHistory(versionId, dto);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status200OK, result.StatusCode);
        _historyService.Verify(s => s.CreateVersionHistoryAsync(versionId, dto), Times.Once);
    }

    [Fact]
    public async Task GetHistoryById_WhenReadDenied_ReturnsNotFoundAndDoesNotCallService()
    {
        const string historyId = "507f1f77bcf86cd799439014";
        _authorizationService
            .Setup(a => a.CanAccessHistoryAsync(historyId, UserId, ProjectPermission.Read))
            .ReturnsAsync(false);

        var controller = CreateHistoryController();
        var action = await controller.GetHistoryById(historyId, null);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status404NotFound, result.StatusCode);
        _historyService.Verify(
            s => s.GetHistoryByIdAsync(It.IsAny<string>(), It.IsAny<string?>()),
            Times.Never
        );
    }

    [Fact]
    public async Task GetHistoryById_WhenReadAllowed_CallsServiceAndReturnsResult()
    {
        const string historyId = "507f1f77bcf86cd799439014";
        var historyDto = new HistoryResponseDto { Id = historyId };
        _authorizationService
            .Setup(a => a.CanAccessHistoryAsync(historyId, UserId, ProjectPermission.Read))
            .ReturnsAsync(true);
        _historyService
            .Setup(s => s.GetHistoryByIdAsync(historyId, null))
            .ReturnsAsync(Result.Ok(historyDto));

        var controller = CreateHistoryController();
        var action = await controller.GetHistoryById(historyId, null);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status200OK, result.StatusCode);
        _historyService.Verify(s => s.GetHistoryByIdAsync(historyId, null), Times.Once);
    }

    [Fact]
    public async Task UpdateHistory_WhenWriteDenied_ReturnsNotFoundAndDoesNotCallService()
    {
        const string historyId = "507f1f77bcf86cd799439014";
        var dto = new UpdateHistoryDto { Data = "{\"updated\": true}" };
        _authorizationService
            .Setup(a => a.CanAccessHistoryAsync(historyId, UserId, ProjectPermission.Write))
            .ReturnsAsync(false);

        var controller = CreateHistoryController();
        var action = await controller.UpdateHistory(historyId, dto);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status404NotFound, result.StatusCode);
        _historyService.Verify(
            s => s.UpdateHistoryAsync(It.IsAny<string>(), It.IsAny<UpdateHistoryDto>()),
            Times.Never
        );
    }

    [Fact]
    public async Task UpdateHistory_WhenWriteAllowed_CallsServiceAndReturnsResult()
    {
        const string historyId = "507f1f77bcf86cd799439014";
        var dto = new UpdateHistoryDto { Data = "{\"updated\": true}" };
        var historyDto = new HistoryResponseDto { Id = historyId };
        _authorizationService
            .Setup(a => a.CanAccessHistoryAsync(historyId, UserId, ProjectPermission.Write))
            .ReturnsAsync(true);
        _historyService
            .Setup(s => s.UpdateHistoryAsync(historyId, dto))
            .ReturnsAsync(Result.Ok(historyDto));

        var controller = CreateHistoryController();
        var action = await controller.UpdateHistory(historyId, dto);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status200OK, result.StatusCode);
        _historyService.Verify(s => s.UpdateHistoryAsync(historyId, dto), Times.Once);
    }

    [Fact]
    public async Task DeleteHistory_WhenAdminDenied_ReturnsNotFoundAndDoesNotCallService()
    {
        const string historyId = "507f1f77bcf86cd799439014";
        _authorizationService
            .Setup(a => a.CanAccessHistoryAsync(historyId, UserId, ProjectPermission.Admin))
            .ReturnsAsync(false);

        var controller = CreateHistoryController();
        var action = await controller.DeleteHistory(historyId);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status404NotFound, result.StatusCode);
        _historyService.Verify(s => s.DeleteHistoryAsync(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task DeleteHistory_WhenAdminAllowed_CallsServiceAndReturnsResult()
    {
        const string historyId = "507f1f77bcf86cd799439014";
        _authorizationService
            .Setup(a => a.CanAccessHistoryAsync(historyId, UserId, ProjectPermission.Admin))
            .ReturnsAsync(true);
        _historyService
            .Setup(s => s.DeleteHistoryAsync(historyId))
            .ReturnsAsync(Result.Ok(true));

        var controller = CreateHistoryController();
        var action = await controller.DeleteHistory(historyId);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status200OK, result.StatusCode);
        _historyService.Verify(s => s.DeleteHistoryAsync(historyId), Times.Once);
    }

    [Fact]
    public async Task RollbackVersion_WhenVersionAdminDenied_ReturnsNotFoundAndDoesNotCallService()
    {
        const string versionId = "507f1f77bcf86cd799439013";
        const string historyId = "507f1f77bcf86cd799439014";
        _authorizationService
            .Setup(a => a.CanAccessVersionAsync(versionId, UserId, ProjectPermission.Admin))
            .ReturnsAsync(false);

        var controller = CreateHistoryController();
        var action = await controller.RollbackVersion(versionId, historyId);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status404NotFound, result.StatusCode);
        _historyService.Verify(
            s => s.RollbackVersionToHistoryAsync(It.IsAny<string>(), It.IsAny<string>()),
            Times.Never
        );
    }

    [Fact]
    public async Task RollbackVersion_WhenHistoryAdminDenied_ReturnsNotFoundAndDoesNotCallService()
    {
        const string versionId = "507f1f77bcf86cd799439013";
        const string historyId = "507f1f77bcf86cd799439014";
        _authorizationService
            .Setup(a => a.CanAccessVersionAsync(versionId, UserId, ProjectPermission.Admin))
            .ReturnsAsync(true);
        _authorizationService
            .Setup(a => a.CanAccessHistoryAsync(historyId, UserId, ProjectPermission.Admin))
            .ReturnsAsync(false);

        var controller = CreateHistoryController();
        var action = await controller.RollbackVersion(versionId, historyId);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status404NotFound, result.StatusCode);
        _historyService.Verify(
            s => s.RollbackVersionToHistoryAsync(It.IsAny<string>(), It.IsAny<string>()),
            Times.Never
        );
    }

    [Fact]
    public async Task RollbackVersion_WhenBothAdminAllowed_CallsServiceAndReturnsResult()
    {
        const string versionId = "507f1f77bcf86cd799439013";
        const string historyId = "507f1f77bcf86cd799439014";
        var versionDto = new VersionResponseDto { Id = versionId };
        _authorizationService
            .Setup(a => a.CanAccessVersionAsync(versionId, UserId, ProjectPermission.Admin))
            .ReturnsAsync(true);
        _authorizationService
            .Setup(a => a.CanAccessHistoryAsync(historyId, UserId, ProjectPermission.Admin))
            .ReturnsAsync(true);
        _historyService
            .Setup(s => s.RollbackVersionToHistoryAsync(versionId, historyId))
            .ReturnsAsync(Result.Ok(versionDto));

        var controller = CreateHistoryController();
        var action = await controller.RollbackVersion(versionId, historyId);

        var result = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status200OK, result.StatusCode);
        _historyService.Verify(
            s => s.RollbackVersionToHistoryAsync(versionId, historyId),
            Times.Once
        );
    }
}
