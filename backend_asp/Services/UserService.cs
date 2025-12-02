using backend_asp.Common.Attributes;
using backend_asp.DTOs.User;
using backend_asp.Mappers;
using backend_asp.Models;
using backend_asp.Services.Interfaces;
using MongoDB.Driver;

namespace backend_asp.Services;

[ScopedService]
public class UserService(MongoDbContext context, UserMapper mapper) : IUserService
{
    private readonly MongoDbContext _context = context;
    private readonly UserMapper _mapper = mapper;

    public async Task<List<UserResponseDto>> GetAllUsersAsync()
    {
        return await _context.Users
            .Find(_ => true).Project(user => _mapper.ToDto(user)).ToListAsync();
    }

    public async Task<UserResponseDto?> GetUserByIdAsync(string id)
    {
        var user = await _context.Users.Find(user => user.Id == id).FirstOrDefaultAsync();
        return user == null ? null : _mapper.ToDto(user);
    }

    public async Task<UserResponseDto> CreateUserAsync(CreateUserDto user)
    {
        var newUser = _mapper.ToUser(user);
        await _context.Users.InsertOneAsync(newUser);
        return _mapper.ToDto(newUser);
    }

    public async Task<UserResponseDto?> UpdateUserAsync(string id, UpdateUserDto updatedUser)
    {
        var existingUser = await GetUserByIdAsync(id);

        if (existingUser == null)
        {
            return null;
        }

        _mapper.UpdateUser(updatedUser, existingUser);

        var result = await _context.Users.ReplaceOneAsync(user => user.Id == id, _mapper.ToUser(existingUser));
        return result.IsAcknowledged ? _mapper.ToDto(_mapper.ToUser(existingUser)) : null;
    }

    public async Task<bool> DeleteUserAsync(string id)
    {
        var result = await _context.Users.DeleteOneAsync(user => user.Id == id);
        return result.IsAcknowledged && result.DeletedCount > 0;
    }

}