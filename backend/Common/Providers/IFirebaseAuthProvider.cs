using FirebaseAdmin.Auth;

namespace backend.Common.Providers;

public interface IFirebaseAuthProvider
{
    FirebaseAuth Auth { get; }
}
