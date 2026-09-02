using System.Net;
using System.Security.Claims;
using System.Text.Encodings.Web;
using backend.Controllers;
using backend.DTOs.Common;
using backend.DTOs.History;
using backend.DTOs.Project;
using backend.Models;
using backend.Services.EmojiService;
using backend.Services.HistoryService;
using backend.Services.ProjectAuthorizationService;
using backend.Services.ProjectService;
using FluentResults;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;

namespace backend.Test.Controllers;

public class AuthorizationHttpTests : IAsyncLifetime
{
    private const string UserId = "507f1f77bcf86cd799439011";
    private const string ProjectId = "507f1f77bcf86cd799439012";
    private readonly Mock<IProjectService> _projectService = new();
    private readonly Mock<IProjectAuthorizationService> _authorizationService = new();
    private readonly Mock<IHistoryService> _historyService = new();
    private WebApplication _app = null!;
    private HttpClient _client = null!;

    public async Task InitializeAsync()
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder
            .Services.AddAuthentication(TestAuthenticationHandler.SchemeName)
            .AddScheme<AuthenticationSchemeOptions, TestAuthenticationHandler>(
                TestAuthenticationHandler.SchemeName,
                _ => { }
            );
        builder.Services.AddAuthorization();
        builder.Services.AddControllers().AddApplicationPart(typeof(ProjectController).Assembly);
        builder.Services.AddSingleton(_projectService.Object);
        builder.Services.AddSingleton(_authorizationService.Object);
        builder.Services.AddSingleton(_historyService.Object);
        builder.Services.AddSingleton(Mock.Of<IEmojiService>());

        _app = builder.Build();
        _app.UseAuthentication();
        _app.UseAuthorization();
        _app.MapControllers();
        await _app.StartAsync();

        _client = new HttpClient { BaseAddress = new Uri(_app.Urls.Single()) };
    }

    public async Task DisposeAsync()
    {
        _client.Dispose();
        await _app.DisposeAsync();
    }

    [Theory]
    [InlineData("/api/Project")]
    [InlineData("/api/History/projects/project-id/versions")]
    public async Task ProtectedRoutes_WhenAnonymous_ReturnUnauthorized(string path)
    {
        var response = await _client.GetAsync(path);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData(false, HttpStatusCode.NotFound)]
    [InlineData(true, HttpStatusCode.OK)]
    public async Task AuthenticatedProjectRequest_UsesResourceAuthorization(
        bool allowed,
        HttpStatusCode expectedStatus
    )
    {
        _authorizationService
            .Setup(a => a.CanAccessProjectAsync(ProjectId, UserId, ProjectPermission.Read))
            .ReturnsAsync(allowed);
        if (allowed)
        {
            _projectService
                .Setup(s => s.GetProjectByIdAsync(ProjectId))
                .ReturnsAsync(
                    Result.Ok(
                        new ProjectResponseDto
                        {
                            Id = ProjectId,
                            Name = "Test Project",
                            Icon = "1F600",
                        }
                    )
                );
        }

        var response = await _client.SendAsync(AuthenticatedGet($"/api/Project/{ProjectId}"));

        Assert.Equal(expectedStatus, response.StatusCode);
        _projectService.Verify(
            s => s.GetProjectByIdAsync(ProjectId),
            allowed ? Times.Once() : Times.Never()
        );
    }

    [Theory]
    [InlineData(false, HttpStatusCode.NotFound)]
    [InlineData(true, HttpStatusCode.OK)]
    public async Task AuthenticatedHistoryRequest_UsesResourceAuthorization(
        bool allowed,
        HttpStatusCode expectedStatus
    )
    {
        _authorizationService
            .Setup(a => a.CanAccessProjectAsync(ProjectId, UserId, ProjectPermission.Read))
            .ReturnsAsync(allowed);
        if (allowed)
        {
            _historyService
                .Setup(s => s.GetProjectVersionsAsync(ProjectId, It.IsAny<PaginationDto>()))
                .ReturnsAsync(
                    Result.Ok(
                        new PaginatedResponseDto<VersionResponseDto>
                        {
                            Items = [],
                            TotalCount = 0,
                            Page = 1,
                            Limit = 10,
                        }
                    )
                );
        }

        var response = await _client.SendAsync(
            AuthenticatedGet($"/api/History/projects/{ProjectId}/versions")
        );

        Assert.Equal(expectedStatus, response.StatusCode);
        _historyService.Verify(
            s => s.GetProjectVersionsAsync(ProjectId, It.IsAny<PaginationDto>()),
            allowed ? Times.Once() : Times.Never()
        );
    }

    [Fact]
    public async Task EmojiDeleteRoute_IsNotMapped()
    {
        var response = await _client.DeleteAsync("/api/Emojis");

        Assert.Equal(HttpStatusCode.MethodNotAllowed, response.StatusCode);
    }

    private static HttpRequestMessage AuthenticatedGet(string path)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, path);
        request.Headers.Add(TestAuthenticationHandler.UserHeader, UserId);
        return request;
    }

    private sealed class TestAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder
    ) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
    {
        public const string SchemeName = "Test";
        public const string UserHeader = "X-Test-User";

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            var userId = Request.Headers[UserHeader].FirstOrDefault();
            if (string.IsNullOrEmpty(userId))
            {
                return Task.FromResult(AuthenticateResult.NoResult());
            }

            var identity = new ClaimsIdentity(
                [new Claim(ClaimTypes.NameIdentifier, userId)],
                SchemeName
            );
            var ticket = new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName);
            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }
}
