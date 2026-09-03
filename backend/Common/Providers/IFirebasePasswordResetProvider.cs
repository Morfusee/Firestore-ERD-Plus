using FluentResults;

namespace backend.Common.Providers;

public interface IFirebasePasswordResetProvider
{
    Task<Result> SendPasswordResetEmailAsync(string email, string continueUrl);
}
