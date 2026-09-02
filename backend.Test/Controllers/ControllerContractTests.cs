using System.Reflection;
using System.Security.Claims;
using backend.Common.Models;
using backend.Controllers;
using backend.DTOs.Common;
using backend.DTOs.Project;
using backend.DTOs.Settings;
using backend.DTOs.User;
using backend.Models;
using backend.Services.ProjectAuthorizationService;
using backend.Services.ProjectService;
using backend.Services.SettingsService;
using backend.Services.UserService;
using FluentResults;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using Moq;

namespace backend.Test.Controllers;

public class ControllerContractTests
{
    public static TheoryData<Type, string, Type, string?, bool, Type?[]> Contracts =>
        new()
        {
            {
                typeof(AuthController),
                "Register",
                typeof(HttpPostAttribute),
                "register",
                false,
                [typeof(FromBodyAttribute)]
            },
            {
                typeof(AuthController),
                "Login",
                typeof(HttpPostAttribute),
                "login",
                false,
                [typeof(FromBodyAttribute)]
            },
            {
                typeof(AuthController),
                "GoogleAuth",
                typeof(HttpPostAttribute),
                "google",
                false,
                [typeof(FromBodyAttribute)]
            },
            { typeof(AuthController), "Logout", typeof(HttpPostAttribute), "logout", false, [] },
            { typeof(AuthController), "GetCurrentUser", typeof(HttpGetAttribute), "me", false, [] },
            {
                typeof(UsersController),
                "GetUsers",
                typeof(HttpGetAttribute),
                null,
                true,
                [typeof(FromQueryAttribute)]
            },
            {
                typeof(UsersController),
                "GetUserById",
                typeof(HttpGetAttribute),
                "{id}",
                true,
                [null]
            },
            {
                typeof(UsersController),
                "GetUserByEmail",
                typeof(HttpGetAttribute),
                "email/{email}",
                true,
                [null]
            },
            {
                typeof(UsersController),
                "CreateUser",
                typeof(HttpPostAttribute),
                null,
                true,
                [typeof(FromBodyAttribute)]
            },
            {
                typeof(UsersController),
                "UpdateUser",
                typeof(HttpPutAttribute),
                "{id}",
                true,
                [null, typeof(FromBodyAttribute)]
            },
            {
                typeof(UsersController),
                "DeleteUser",
                typeof(HttpDeleteAttribute),
                "{id}",
                true,
                [null]
            },
            {
                typeof(SettingsController),
                "GetSettingsByEmail",
                typeof(HttpGetAttribute),
                null,
                true,
                [typeof(FromQueryAttribute)]
            },
            {
                typeof(SettingsController),
                "CreateSettings",
                typeof(HttpPostAttribute),
                null,
                true,
                [typeof(FromBodyAttribute)]
            },
            {
                typeof(SettingsController),
                "UpdateSettings",
                typeof(HttpPutAttribute),
                null,
                true,
                [typeof(FromBodyAttribute)]
            },
            {
                typeof(ProjectController),
                "GetAllProjects",
                typeof(HttpGetAttribute),
                null,
                true,
                [typeof(FromQueryAttribute)]
            },
            {
                typeof(ProjectController),
                "GetProjectById",
                typeof(HttpGetAttribute),
                "{id}",
                true,
                [typeof(FromRouteAttribute)]
            },
            {
                typeof(ProjectController),
                "GetProjectsByEmail",
                typeof(HttpGetAttribute),
                "by-email",
                true,
                [typeof(FromQueryAttribute), typeof(FromQueryAttribute)]
            },
            {
                typeof(ProjectController),
                "CreateProject",
                typeof(HttpPostAttribute),
                null,
                true,
                [typeof(FromBodyAttribute)]
            },
            {
                typeof(ProjectController),
                "SaveProject",
                typeof(HttpPatchAttribute),
                null,
                true,
                [typeof(FromBodyAttribute)]
            },
            {
                typeof(ProjectController),
                "UpdateProject",
                typeof(HttpPatchAttribute),
                "details",
                true,
                [typeof(FromBodyAttribute)]
            },
            {
                typeof(ProjectController),
                "DeleteProject",
                typeof(HttpDeleteAttribute),
                "{id}",
                true,
                [typeof(FromRouteAttribute)]
            },
            {
                typeof(EmojisController),
                "GetAllEmojis",
                typeof(HttpGetAttribute),
                null,
                false,
                [typeof(FromQueryAttribute), typeof(FromQueryAttribute)]
            },
            {
                typeof(EmojisController),
                "GetEmojiByHexcode",
                typeof(HttpGetAttribute),
                "{hexcode}",
                false,
                [typeof(FromRouteAttribute)]
            },
            {
                typeof(EmojisController),
                "DeleteAllEmojis",
                typeof(HttpDeleteAttribute),
                null,
                false,
                []
            },
            {
                typeof(HistoryController),
                "GetProjectVersions",
                typeof(HttpGetAttribute),
                "projects/{projectId}/versions",
                true,
                [typeof(FromRouteAttribute), typeof(FromQueryAttribute)]
            },
            {
                typeof(HistoryController),
                "CreateProjectVersion",
                typeof(HttpPostAttribute),
                "projects/{projectId}/versions",
                true,
                [typeof(FromRouteAttribute), typeof(FromBodyAttribute)]
            },
            {
                typeof(HistoryController),
                "GetVersionById",
                typeof(HttpGetAttribute),
                "versions/{versionId}",
                true,
                [typeof(FromRouteAttribute), typeof(FromQueryAttribute)]
            },
            {
                typeof(HistoryController),
                "UpdateVersion",
                typeof(HttpPatchAttribute),
                "versions/{versionId}",
                true,
                [typeof(FromRouteAttribute), typeof(FromBodyAttribute)]
            },
            {
                typeof(HistoryController),
                "DeleteVersion",
                typeof(HttpDeleteAttribute),
                "versions/{versionId}",
                true,
                [typeof(FromRouteAttribute)]
            },
            {
                typeof(HistoryController),
                "GetVersionHistories",
                typeof(HttpGetAttribute),
                "versions/{versionId}/histories",
                true,
                [typeof(FromRouteAttribute), typeof(FromQueryAttribute)]
            },
            {
                typeof(HistoryController),
                "CreateVersionHistory",
                typeof(HttpPostAttribute),
                "versions/{versionId}/histories",
                true,
                [typeof(FromRouteAttribute), typeof(FromBodyAttribute)]
            },
            {
                typeof(HistoryController),
                "GetHistoryById",
                typeof(HttpGetAttribute),
                "histories/{historyId}",
                true,
                [typeof(FromRouteAttribute), typeof(FromQueryAttribute)]
            },
            {
                typeof(HistoryController),
                "UpdateHistory",
                typeof(HttpPatchAttribute),
                "histories/{historyId}",
                true,
                [typeof(FromRouteAttribute), typeof(FromBodyAttribute)]
            },
            {
                typeof(HistoryController),
                "DeleteHistory",
                typeof(HttpDeleteAttribute),
                "histories/{historyId}",
                true,
                [typeof(FromRouteAttribute)]
            },
            {
                typeof(HistoryController),
                "RollbackVersion",
                typeof(HttpPostAttribute),
                "versions/{versionId}/rollback/{historyId}",
                true,
                [typeof(FromRouteAttribute), typeof(FromRouteAttribute)]
            },
        };

    [Theory]
    [MemberData(nameof(Contracts))]
    public void Action_HasCurrentRouteVerbBindingAndAuthorization(
        Type controllerType,
        string actionName,
        Type verbType,
        string? template,
        bool authorized,
        Type?[] bindingTypes
    )
    {
        var route = Assert.Single(controllerType.GetCustomAttributes<RouteAttribute>());
        Assert.Equal("api/[controller]", route.Template);

        var method = Assert.Single(controllerType.GetMethods().Where(m => m.Name == actionName));
        var verb = Assert.Single(method.GetCustomAttributes().Where(a => a.GetType() == verbType));
        Assert.Equal(template, Assert.IsAssignableFrom<HttpMethodAttribute>(verb).Template);
        Assert.Equal(authorized, method.IsDefined(typeof(AuthorizeAttribute)));

        var parameters = method.GetParameters();
        Assert.Equal(bindingTypes.Length, parameters.Length);
        for (var index = 0; index < parameters.Length; index++)
        {
            var actualBinding = parameters[index]
                .GetCustomAttributes()
                .SingleOrDefault(a => a is IBindingSourceMetadata)
                ?.GetType();
            Assert.Equal(bindingTypes[index], actualBinding);
        }
    }

    [Fact]
    public async Task UsersController_MissingUserOperations_ReturnNotFound()
    {
        var service = new Mock<IUserService>();
        service
            .Setup(s => s.GetUserByIdAsync(It.IsAny<string>()))
            .ReturnsAsync(NotFound<UserResponseDto>("User not found"));
        service
            .Setup(s => s.GetUserByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync(NotFound<UserResponseDto>("User not found"));
        service
            .Setup(s => s.UpdateUserAsync(It.IsAny<string>(), It.IsAny<UpdateUserDto>()))
            .ReturnsAsync(NotFound<UserResponseDto>("User not found"));
        service
            .Setup(s => s.DeleteUserAsync(It.IsAny<string>()))
            .ReturnsAsync(NotFound<bool>("User not found"));
        var controller = new UsersController(service.Object, Mock.Of<ILogger<UsersController>>());

        AssertNotFound(await controller.GetUserById("missing"));
        AssertNotFound(await controller.GetUserByEmail("missing@example.com"));
        AssertNotFound(
            await controller.UpdateUser(
                "missing",
                new UpdateUserDto { Email = "missing@example.com" }
            )
        );
        AssertNotFound(await controller.DeleteUser("missing"));
    }

    [Fact]
    public async Task SettingsController_MissingResourceOperations_ReturnNotFound()
    {
        var email = new EmailDto { Email = "missing@example.com" };
        var service = new Mock<ISettingsService>();
        service
            .Setup(s => s.GetSettingsByEmailAsync(It.IsAny<EmailDto>()))
            .ReturnsAsync(NotFound<SettingsResponseDto>("Settings not found"));
        service
            .Setup(s => s.CreateSettingsAsync(It.IsAny<CreateSettingsDto>()))
            .ReturnsAsync(NotFound<SettingsResponseDto>("User not found"));
        service
            .Setup(s => s.UpdateSettingsAsync(It.IsAny<UpdateSettingsDto>()))
            .ReturnsAsync(NotFound<SettingsResponseDto>("Settings not found"));
        var controller = new SettingsController(
            service.Object,
            Mock.Of<ILogger<SettingsController>>()
        );

        AssertNotFound(await controller.GetSettingsByEmail(email));
        AssertNotFound(
            await controller.CreateSettings(new CreateSettingsDto { Email = email.Email })
        );
        AssertNotFound(
            await controller.UpdateSettings(new UpdateSettingsDto { Email = email.Email })
        );
    }

    [Fact]
    public async Task ProjectController_MissingResourceOperations_ReturnNotFound()
    {
        var service = new Mock<IProjectService>();
        var accessFilter = Builders<Project>.Filter.Empty;
        service
            .Setup(s => s.GetProjectByIdAsync(It.IsAny<string>()))
            .ReturnsAsync(NotFound<ProjectResponseDto>("Project not found"));
        service
            .Setup(s => s.GetAllProjectsAsync(It.IsAny<PaginationDto>(), accessFilter))
            .ReturnsAsync(NotFound<PaginatedResponseDto<ProjectResponseDto>>("User not found"));
        service
            .Setup(s => s.CreateProjectAsync(It.IsAny<CreateProjectDto>()))
            .ReturnsAsync(NotFound<ProjectResponseDto>("User not found"));
        service
            .Setup(s => s.SaveProjectAsync(It.IsAny<SaveProjectDto>()))
            .ReturnsAsync(NotFound<ProjectResponseDto>("Project not found"));
        service
            .Setup(s => s.UpdateProjectAsync(It.IsAny<UpdateProjectDto>()))
            .ReturnsAsync(NotFound<ProjectResponseDto>("Project not found"));
        service
            .Setup(s => s.DeleteProjectAsync(It.IsAny<string>()))
            .ReturnsAsync(NotFound<bool>("Project not found"));
        var authService = new Mock<IProjectAuthorizationService>();
        authService
            .Setup(a =>
                a.CanAccessProjectAsync(
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<ProjectPermission>()
                )
            )
            .ReturnsAsync(true);
        authService
            .Setup(a => a.MatchesUserEmailAsync(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(true);
        authService.Setup(a => a.GetAccessibleProjectsFilter("user-123")).Returns(accessFilter);
        var controller = new ProjectController(service.Object, authService.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(
                        new ClaimsIdentity(
                            [new Claim(ClaimTypes.NameIdentifier, "user-123")],
                            "TestAuth"
                        )
                    ),
                },
            },
        };

        AssertNotFound(await controller.GetProjectById("missing"));
        AssertNotFound(
            await controller.GetProjectsByEmail(
                new EmailDto { Email = "missing@example.com" },
                new PaginationDto()
            )
        );
        AssertNotFound(
            await controller.CreateProject(
                new CreateProjectDto
                {
                    Email = "missing@example.com",
                    Name = "Missing",
                    Icon = "1F600",
                }
            )
        );
        AssertNotFound(
            await controller.SaveProject(new SaveProjectDto { Id = "missing", Data = "{}" })
        );
        AssertNotFound(await controller.UpdateProject(new UpdateProjectDto { Id = "missing" }));
        AssertNotFound(await controller.DeleteProject("missing"));
    }

    private static Result<T> NotFound<T>(string message) =>
        Result.Fail<T>(new Error(message).WithMetadata("NotFound", true));

    private static void AssertNotFound<T>(ActionResult<ApiResponse<T>> action)
    {
        var response = Assert.IsType<ObjectResult>(action.Result);
        Assert.Equal(StatusCodes.Status404NotFound, response.StatusCode);
    }
}
