using backend.DTOs.User;
using FluentResults;

namespace backend.Services.UserService;

public interface IUserService
{
    Task<Result<IEnumerable<UserResponseDto>>> GetAllUsersAsync();
    Task<Result<UserResponseDto>> GetUserByIdAsync(string id);
    Task<Result<UserResponseDto>> CreateUserAsync(CreateUserDto user);
    Task<Result<UserResponseDto>> UpdateUserAsync(string id, UpdateUserDto updatedUser);
    Task<Result<bool>> DeleteUserAsync(string id);
}