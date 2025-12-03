using backend.Common.Attributes;
using backend.DTOs.User;
using backend.Mappers;
using backend.Models;
using backend.Services.Interfaces;
using FluentResults;
using MongoDB.Driver;

namespace backend.Services;

[ScopedService]
public class UserService(MongoDbContext context, UserMapper mapper) : IUserService
{
    private readonly MongoDbContext _context = context;
    private readonly UserMapper _mapper = mapper;

    public async Task<Result<IEnumerable<UserResponseDto>>> GetAllUsersAsync()
    {
        var users = await _context.Users.Find(_ => true).ToListAsync();
        return users.Select(u => _mapper.ToDto(u)).ToList();
    }

    public async Task<Result<UserResponseDto?>> GetUserByIdAsync(string id)
    {
        var user = await _context.Users.Find(user => user.Id == id).FirstOrDefaultAsync();
        return user == null ? null : _mapper.ToDto(user);
    }

    public async Task<Result<UserResponseDto>> CreateUserAsync(CreateUserDto user)
    {
        try
        {
            var newUser = _mapper.ToUser(user);
            await _context.Users.InsertOneAsync(newUser);
            return _mapper.ToDto(newUser);
        }
        catch (Exception ex)
        {
            return Result.Fail(ex.Message);
        }
    }

    public async Task<Result<UserResponseDto?>> UpdateUserAsync(string id, UpdateUserDto updatedUser)
    {
        var existingUser = await GetUserByIdAsync(id);

        if (existingUser.IsFailed || existingUser.Value == null)
        {
            return Result.Fail("User not found");
        }

        _mapper.UpdateUser(updatedUser, existingUser.Value);

        var result = await _context.Users.ReplaceOneAsync(user => user.Id == id, _mapper.ToUser(existingUser.Value));
        return result.IsAcknowledged ? _mapper.ToDto(_mapper.ToUser(existingUser.Value)) : null;
    }

    public async Task<Result<bool>> DeleteUserAsync(string id)
    {
        var result = await _context.Users.DeleteOneAsync(user => user.Id == id);
        return result.IsAcknowledged && result.DeletedCount > 0;
    }

}