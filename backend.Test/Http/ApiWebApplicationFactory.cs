using System.Security.Claims;
using System.Text.Encodings.Web;
using backend.Config;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Mongo2Go;

namespace backend.Test.Http;

public class ApiWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly MongoDbRunner _runner = MongoDbRunner.Start();

    public ApiWebApplicationFactory() { }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting(WebHostDefaults.EnvironmentKey, "Development");
        builder.ConfigureServices(
            services =>
            {
                services.PostConfigure<MongoDbSettings>(
                    options =>
                    {
                        options.ConnectionString = _runner.ConnectionString;
                        options.DatabaseName = "FirestoreERDPlusApiTests";
                    }
                );
                services.AddAuthentication(TestAuthHandler.SchemeName)
                    .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                        TestAuthHandler.SchemeName,
                        _ => { }
                    );
            }
        );
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        _runner.Dispose();
    }
}

// Keeps WebApplicationFactory requests away from Firebase credential loading.
internal sealed class TestAuthHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder
) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "TestAuth";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var identity = new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, "test-user")], SchemeName);
        var principal = new ClaimsPrincipal(identity);
        return Task.FromResult(
            AuthenticateResult.Success(new AuthenticationTicket(principal, SchemeName))
        );
    }
}
