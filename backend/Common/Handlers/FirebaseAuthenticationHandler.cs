using System.Security.Claims;
using System.Text.Encodings.Web;
using backend.Services.AuthService;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;

namespace backend.Common.Handlers;

public class FirebaseAuthenticationHandler(
    IOptionsMonitor<JwtBearerOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    IAuthService authService
) : AuthenticationHandler<JwtBearerOptions>(options, logger, encoder)
{
    private readonly IAuthService _authService = authService;

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // Check for token in Authorization header
        if (
            !Request.Headers.TryGetValue("Authorization", out var authorizationHeader)
            || string.IsNullOrEmpty(authorizationHeader)
        )
        {
            // Check for token in cookie
            if (!Request.Cookies.TryGetValue("access_token", out var cookieToken))
            {
                return AuthenticateResult.NoResult();
            }

            authorizationHeader = cookieToken;
        }

        var token = authorizationHeader.ToString().Replace("Bearer ", string.Empty);

        if (string.IsNullOrEmpty(token))
        {
            return AuthenticateResult.NoResult();
        }

        try
        {
            var result = await _authService.VerifyTokenAsync(token);

            if (result.IsFailed)
            {
                return AuthenticateResult.Fail(result.Errors[0].Message);
            }

            var userId = result.Value;

            var claims = new[] { new Claim(ClaimTypes.NameIdentifier, userId) };

            var identity = new ClaimsIdentity(claims, Scheme.Name);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);

            return AuthenticateResult.Success(ticket);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Authentication failed.");
            return AuthenticateResult.Fail("Authentication failed.");
        }
    }
}
