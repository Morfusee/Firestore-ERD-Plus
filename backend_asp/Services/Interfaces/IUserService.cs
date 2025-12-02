using backend_asp.Common.Attributes;
using backend_asp.DTOs.User;
using backend_asp.Models;

namespace backend_asp.Services.Interfaces;

public interface IUserService
{
    Task<List<UserResponseDto>> GetAllUsersAsync();
    Task<UserResponseDto?> GetUserByIdAsync(string id);
    Task<UserResponseDto> CreateUserAsync(CreateUserDto user);
    Task<UserResponseDto?> UpdateUserAsync(string id, UpdateUserDto updatedUser);
    Task<bool> DeleteUserAsync(string id);
}