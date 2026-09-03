using backend.Common.Attributes;
using backend.Config;
using FirebaseAdmin;
using FirebaseAdmin.Auth;
using FluentResults;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Options;

namespace backend.Common.Providers;

[SingletonService]
public class FirebaseAuthProvider : IFirebaseAuthProvider
{
    private readonly FirebaseAuth _auth;

    public FirebaseAuthProvider(IOptions<FirebaseSettings> settings)
    {
        // Ensure the app is initialized only once
        if (FirebaseApp.DefaultInstance == null)
        {
            var json = settings.Value.ServiceAccountJson;
            FirebaseApp.Create(
                new AppOptions
                {
                    Credential = GoogleCredential.FromJson(json),
                    ProjectId = settings.Value.ProjectId,
                }
            );
        }

        _auth = FirebaseAuth.DefaultInstance;
    }

    public FirebaseAuth Auth => _auth;

    public async Task<Result<VerifiedFirebaseUser>> VerifyIdentityAsync(
        string idToken,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var token = await _auth.VerifyIdTokenAsync(idToken, cancellationToken);
            var user = await _auth.GetUserAsync(token.Uid, cancellationToken);
            if (user == null)
            {
                return Result.Fail<VerifiedFirebaseUser>("Invalid authentication token.");
            }

            var email = user.Email;
            if (string.IsNullOrWhiteSpace(email) && token.Claims.TryGetValue("email", out var claim))
            {
                email = claim?.ToString();
            }

            if (string.IsNullOrWhiteSpace(email))
            {
                return Result.Fail<VerifiedFirebaseUser>(
                    "Email not provided by authentication token."
                );
            }

            return Result.Ok(new VerifiedFirebaseUser(token.Uid, email, user.DisplayName));
        }
        catch (Exception ex)
        {
            return Result
                .Fail<VerifiedFirebaseUser>("Token verification failed.")
                .WithError(ex.Message);
        }
    }
}
