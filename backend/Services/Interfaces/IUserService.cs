using backend.Common.Attributes;
using backend.DTOs.User;
using backend.Models;

namespace backend.Services.Interfaces;

public interface IUserService
{
    Task<List<UserResponseDto>> GetAllUsersAsync();
    Task<UserResponseDto?> GetUserByIdAsync(string id);
    Task<UserResponseDto> CreateUserAsync(CreateUserDto user);
    Task<UserResponseDto?> UpdateUserAsync(string id, UpdateUserDto updatedUser);
    Task<bool> DeleteUserAsync(string id);
}