using backend.DTOs.Auth;
using FluentResults;

namespace backend.Services.AuthService;

public interface IAuthService
{
    Task<Result<AuthResponseDto>> RegisterAsync(RegisterDto registerDto);
    Task<Result<AuthResponseDto>> LoginAsync(LoginDto loginDto);
    Task<Result<string>> VerifyTokenAsync(string token);
}
