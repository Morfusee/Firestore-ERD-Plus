using backend.DTOs.Common;
using backend.DTOs.User;
using FluentResults;

namespace backend.Services.UserService;

public interface IUserService
{
    Task<Result<PaginatedResponseDto<UserResponseDto>>> GetAllUsersAsync(PaginationDto pagination);
    Task<Result<UserResponseDto>> GetUserByIdAsync(string id);
    Task<Result<UserResponseDto>> GetUserByEmailAsync(string email);
    Task<Result<UserSearchResponseDto>> SearchUsersAsync(UserSearchDto search);
    Task<Result<UserResponseDto>> CreateUserAsync(CreateUserDto user);
    Task<Result<UserResponseDto>> UpdateUserAsync(string id, UpdateUserDto updatedUser);
    Task<Result<bool>> DeleteUserAsync(string id);
}
