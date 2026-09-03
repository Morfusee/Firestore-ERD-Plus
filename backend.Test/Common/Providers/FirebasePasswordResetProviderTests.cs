using System.Net;
using System.Net.Http.Json;
using backend.Common.Providers;
using backend.Config;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Moq;

namespace backend.Test.Common.Providers;

public class FirebasePasswordResetProviderTests
{
    private static FirebasePasswordResetProvider CreateProvider(HttpMessageHandler handler)
    {
        var factory = new Mock<IHttpClientFactory>();
        factory
            .Setup(f => f.CreateClient(nameof(FirebasePasswordResetProvider)))
            .Returns(new HttpClient(handler));
        return new FirebasePasswordResetProvider(
            factory.Object,
            Options.Create(new FirebaseSettings { ApiKey = "test-key" }),
            NullLogger<FirebasePasswordResetProvider>.Instance
        );
    }

    [Fact]
    public async Task SendPasswordResetEmailAsync_ValidRequest_PostsFirebasePayload()
    {
        string? body = null;
        var handler = new StubHandler(async request =>
        {
            Assert.Equal(
                "https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=test-key",
                request.RequestUri!.ToString()
            );
            body = await request.Content!.ReadAsStringAsync();
            return new HttpResponseMessage(HttpStatusCode.OK);
        });

        var result = await CreateProvider(handler)
            .SendPasswordResetEmailAsync("user@example.com", "https://frontend.example");

        Assert.True(result.IsSuccess);
        Assert.Contains("PASSWORD_RESET", body);
        Assert.Contains("https://frontend.example", body);
    }

    [Fact]
    public async Task SendPasswordResetEmailAsync_UnknownEmail_ReturnsEmailNotFoundMetadata()
    {
        var handler = new StubHandler(_ =>
            Task.FromResult(
                new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = JsonContent.Create(
                        new { error = new { message = "EMAIL_NOT_FOUND" } }
                    ),
                }
            )
        );

        var result = await CreateProvider(handler)
            .SendPasswordResetEmailAsync("missing@example.com", "https://frontend.example");

        Assert.True(result.IsFailed);
        Assert.Contains(result.Errors, error => error.Metadata.ContainsKey("EmailNotFound"));
    }

    [Fact]
    public async Task SendPasswordResetEmailAsync_ProviderFailure_ReturnsExternalServiceError()
    {
        var handler = new StubHandler(_ =>
            Task.FromResult(
                new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = JsonContent.Create(new { error = new { message = "INVALID_EMAIL" } }),
                }
            )
        );

        var result = await CreateProvider(handler)
            .SendPasswordResetEmailAsync("user@example.com", "https://frontend.example");

        Assert.True(result.IsFailed);
        Assert.Contains(result.Errors, error => error.Metadata.ContainsKey("ExternalServiceError"));
    }

    private sealed class StubHandler(Func<HttpRequestMessage, Task<HttpResponseMessage>> sendAsync)
        : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken
        ) => sendAsync(request);
    }
}
