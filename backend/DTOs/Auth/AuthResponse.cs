using backend.DTOs.User;

namespace backend.DTOs.Auth;

public class AuthResponseDto
{
    public required string Token { get; set; }
    public required UserResponseDto User { get; set; }
}
