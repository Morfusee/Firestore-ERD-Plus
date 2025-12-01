using backend_asp.Common.Attributes;
using backend_asp.Models;

namespace backend_asp.Services.Interfaces;

public interface IUserService
{
    Task<List<User>> GetAllUsersAsync();
    Task<User?> GetUserByIdAsync(string id);
    Task<User> CreateUserAsync(User user);
    Task<User?> UpdateUserAsync(string id, User updatedUser);
    Task<bool> DeleteUserAsync(string id);
}