using System.Security.Claims;
using backend.Common.Models;
using backend.Controllers;
using backend.DTOs.Common;
using backend.DTOs.Project;
using backend.Models;
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
}
