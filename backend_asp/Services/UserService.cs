

using backend_asp.Models;
using MongoDB.Driver;

namespace backend_asp.Services;

public class UserService(MongoDbContext context)
{
    private readonly MongoDbContext _context = context;

    public async Task<List<User>> GetAllUsersAsync()
    {
        return await _context.Users.Find(_ => true).ToListAsync();
    }

    public async Task<User?> GetUserByIdAsync(string id)
    {
        return await _context.Users.Find(user => user.Id == id).FirstOrDefaultAsync();
    }

    public async Task<User> CreateUserAsync(User user)
    {
        await _context.Users.InsertOneAsync(user);
        return user;
    }

    public async Task<User?> UpdateUserAsync(string id, User updatedUser)
    {
        var result = await _context.Users.ReplaceOneAsync(user => user.Id == id, updatedUser);
        return result.IsAcknowledged && result.ModifiedCount > 0 ? updatedUser : null;
    }

    public async Task<bool> DeleteUserAsync(string id)
    {
        var result = await _context.Users.DeleteOneAsync(user => user.Id == id);
        return result.IsAcknowledged && result.DeletedCount > 0;
    }

}