using backend.DTOs.Auth;
using backend.DTOs.Common;
using FluentResults;

namespace backend.Services.AuthService;

public interface IAuthService
{
    Task<Result<AuthResponseDto>> RegisterAsync(RegisterDto registerDto);
    Task<Result<AuthResponseDto>> LoginAsync(LoginDto loginDto);
    Task<Result<AuthResponseDto>> GoogleAuthAsync(GoogleAuthDto googleAuthDto);
    Task<Result<string>> VerifyTokenAsync(string token);
    Task<Result<bool>> ResetPasswordAsync(EmailDto emailDto);
}
