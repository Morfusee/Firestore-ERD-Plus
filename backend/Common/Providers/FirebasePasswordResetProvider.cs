using System.Text.Json;
using backend.Common.Attributes;
using backend.Config;
using FluentResults;
using Microsoft.Extensions.Options;

namespace backend.Common.Providers;

[SingletonService]
public class FirebasePasswordResetProvider(
    IHttpClientFactory httpClientFactory,
    IOptions<FirebaseSettings> settings,
    ILogger<FirebasePasswordResetProvider> logger
) : IFirebasePasswordResetProvider
{
    private readonly HttpClient _httpClient = httpClientFactory.CreateClient(
        nameof(FirebasePasswordResetProvider)
    );
    private readonly string _apiKey = settings.Value.ApiKey;
    private readonly ILogger<FirebasePasswordResetProvider> _logger = logger;

    public async Task<Result> SendPasswordResetEmailAsync(string email, string continueUrl)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync(
                $"https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key={Uri.EscapeDataString(_apiKey)}",
                new
                {
                    requestType = "PASSWORD_RESET",
                    email,
                    continueUrl,
                }
            );
            if (response.IsSuccessStatusCode)
            {
                return Result.Ok();
            }

            using var document = await JsonDocument.ParseAsync(
                await response.Content.ReadAsStreamAsync()
            );
            string? code = null;
            if (
                document.RootElement.TryGetProperty("error", out var error)
                && error.TryGetProperty("message", out var message)
            )
            {
                code = message.GetString();
            }

            return code == "EMAIL_NOT_FOUND"
                ? Result.Fail(
                    new Error("Password reset request accepted.").WithMetadata(
                        "EmailNotFound",
                        true
                    )
                )
                : ExternalFailure();
        }
        catch (Exception exception) when (exception is HttpRequestException or JsonException)
        {
            _logger.LogError(exception, "Firebase password reset request failed.");
            return ExternalFailure();
        }
    }

    private static Result ExternalFailure() =>
        Result.Fail(
            new Error("Password reset is currently unavailable.").WithMetadata(
                "ExternalServiceError",
                true
            )
        );
}
