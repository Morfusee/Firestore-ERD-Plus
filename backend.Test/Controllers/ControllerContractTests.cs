using System.Reflection;
using backend.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Routing;

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
                false,
                [typeof(FromQueryAttribute)]
            },
            {
                typeof(ProjectController),
                "GetProjectById",
                typeof(HttpGetAttribute),
                "{id}",
                false,
                [typeof(FromRouteAttribute)]
            },
            {
                typeof(ProjectController),
                "GetProjectsByEmail",
                typeof(HttpGetAttribute),
                "by-email",
                false,
                [typeof(FromQueryAttribute), typeof(FromQueryAttribute)]
            },
            {
                typeof(ProjectController),
                "CreateProject",
                typeof(HttpPostAttribute),
                null,
                false,
                [typeof(FromBodyAttribute)]
            },
            {
                typeof(ProjectController),
                "SaveProject",
                typeof(HttpPatchAttribute),
                null,
                false,
                [typeof(FromBodyAttribute)]
            },
            {
                typeof(ProjectController),
                "UpdateProject",
                typeof(HttpPatchAttribute),
                "details",
                false,
                [typeof(FromBodyAttribute)]
            },
            {
                typeof(ProjectController),
                "DeleteProject",
                typeof(HttpDeleteAttribute),
                "{id}",
                false,
                [typeof(FromRouteAttribute)]
            },
            {
                typeof(EmojisController),
                "GetAllEmojis",
                typeof(HttpGetAttribute),
                null,
                false,
                [typeof(FromQueryAttribute)]
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
                false,
                [typeof(FromRouteAttribute), typeof(FromQueryAttribute)]
            },
            {
                typeof(HistoryController),
                "CreateProjectVersion",
                typeof(HttpPostAttribute),
                "projects/{projectId}/versions",
                false,
                [typeof(FromRouteAttribute), typeof(FromBodyAttribute)]
            },
            {
                typeof(HistoryController),
                "GetVersionById",
                typeof(HttpGetAttribute),
                "versions/{versionId}",
                false,
                [typeof(FromRouteAttribute), typeof(FromQueryAttribute)]
            },
            {
                typeof(HistoryController),
                "UpdateVersion",
                typeof(HttpPatchAttribute),
                "versions/{versionId}",
                false,
                [typeof(FromRouteAttribute), typeof(FromBodyAttribute)]
            },
            {
                typeof(HistoryController),
                "DeleteVersion",
                typeof(HttpDeleteAttribute),
                "versions/{versionId}",
                false,
                [typeof(FromRouteAttribute)]
            },
            {
                typeof(HistoryController),
                "GetVersionHistories",
                typeof(HttpGetAttribute),
                "versions/{versionId}/histories",
                false,
                [typeof(FromRouteAttribute), typeof(FromQueryAttribute)]
            },
            {
                typeof(HistoryController),
                "CreateVersionHistory",
                typeof(HttpPostAttribute),
                "versions/{versionId}/histories",
                false,
                [typeof(FromRouteAttribute), typeof(FromBodyAttribute)]
            },
            {
                typeof(HistoryController),
                "GetHistoryById",
                typeof(HttpGetAttribute),
                "histories/{historyId}",
                false,
                [typeof(FromRouteAttribute), typeof(FromQueryAttribute)]
            },
            {
                typeof(HistoryController),
                "UpdateHistory",
                typeof(HttpPatchAttribute),
                "histories/{historyId}",
                false,
                [typeof(FromRouteAttribute), typeof(FromBodyAttribute)]
            },
            {
                typeof(HistoryController),
                "DeleteHistory",
                typeof(HttpDeleteAttribute),
                "histories/{historyId}",
                false,
                [typeof(FromRouteAttribute)]
            },
            {
                typeof(HistoryController),
                "RollbackVersion",
                typeof(HttpPostAttribute),
                "versions/{versionId}/rollback/{historyId}",
                false,
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
}
