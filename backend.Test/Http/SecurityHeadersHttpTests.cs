using System.Net.Http.Headers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;

namespace backend.Test.Http;

public class SecurityHeadersHttpTests : IClassFixture<ApiWebApplicationFactory>
{
    private readonly ApiWebApplicationFactory _factory;

    public SecurityHeadersHttpTests(ApiWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Theory]
    [InlineData("Development")]
    [InlineData("Production")]
    public async Task Response_AlwaysIncludesBaselineSecurityHeaders(string environment)
    {
        using var client = _factory
            .WithWebHostBuilder(builder => builder.UseEnvironment(environment))
            .CreateClient();

        var response = await client.GetAsync("/api/Emojis");

        AssertHeader(response.Headers, "X-Frame-Options", "DENY");
        AssertHeader(response.Headers, "X-Content-Type-Options", "nosniff");
        AssertHeader(response.Headers, "X-Permitted-Cross-Domain-Policies", "none");
    }

    [Fact]
    public async Task Response_ProductionHttps_IncludesHsts()
    {
        using var client = _factory
            .WithWebHostBuilder(builder => builder.UseEnvironment("Production"))
            .CreateClient(
                new WebApplicationFactoryClientOptions
                {
                    BaseAddress = new Uri("https://firestore-erd-plus.test"),
                }
            );

        var response = await client.GetAsync("/api/Emojis");

        AssertHeader(
            response.Headers,
            "Strict-Transport-Security",
            "max-age=31536000; includeSubDomains; preload"
        );
    }

    [Fact]
    public async Task Response_DevelopmentHttps_OmitsHsts()
    {
        using var client = _factory
            .WithWebHostBuilder(builder => builder.UseEnvironment("Development"))
            .CreateClient(
                new WebApplicationFactoryClientOptions
                {
                    BaseAddress = new Uri("https://firestore-erd-plus.test"),
                }
            );

        var response = await client.GetAsync("/api/Emojis");

        Assert.False(
            response.Headers.TryGetValues("Strict-Transport-Security", out _),
            "Development responses must not include HSTS"
        );
    }

    [Fact]
    public async Task Response_LocalhostHttps_OmitsHstsEvenInProduction()
    {
        using var client = _factory
            .WithWebHostBuilder(builder => builder.UseEnvironment("Production"))
            .CreateClient(
                new WebApplicationFactoryClientOptions
                {
                    BaseAddress = new Uri("https://localhost"),
                }
            );

        var response = await client.GetAsync("/api/Emojis");

        Assert.False(
            response.Headers.TryGetValues("Strict-Transport-Security", out _),
            "Localhost responses must not include HSTS"
        );
    }

    private static void AssertHeader(HttpResponseHeaders headers, string name, string value)
    {
        Assert.True(headers.TryGetValues(name, out var values), $"{name} header missing");
        Assert.StartsWith(value, Assert.Single(values));
    }
}
