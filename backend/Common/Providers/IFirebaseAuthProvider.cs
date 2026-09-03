using FirebaseAdmin.Auth;
using FluentResults;

namespace backend.Common.Providers;

public interface IFirebaseAuthProvider
{
    FirebaseAuth Auth { get; }

    Task<Result<VerifiedFirebaseUser>> VerifyIdentityAsync(
        string idToken,
        CancellationToken cancellationToken = default
    );
}

/// <summary>
/// Minimal trusted identity extracted from a verified Firebase ID token.
/// Keeps Firebase SDK types out of service logic and unit tests.
/// </summary>
public sealed record VerifiedFirebaseUser(string Uid, string Email, string? DisplayName);
