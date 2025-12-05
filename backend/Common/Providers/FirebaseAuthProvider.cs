using backend.Common.Attributes;
using backend.Config;
using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Options;

namespace backend.Common.Providers;

[SingletonService]
public class FirebaseAuthProvider
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
}
