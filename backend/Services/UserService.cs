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
        try
        {
            var users = await _context.Users.Find(_ => true).ToListAsync();
            var userDtos = users.ConvertAll(user => _mapper.ToDto(user));
            return Result.Ok<IEnumerable<UserResponseDto>>(userDtos);
        }
        catch (Exception ex)
        {
            return Result
                .Fail<IEnumerable<UserResponseDto>>("Failed to retrieve users")
                .WithError(ex.Message);
        }
    }

    public async Task<Result<UserResponseDto>> GetUserByIdAsync(string id)
    {
        try
        {
            var user = await _context.Users.Find(user => user.Id == id).FirstOrDefaultAsync();
            return user == null
                ? Result.Fail<UserResponseDto>("User not found")
                : Result.Ok(_mapper.ToDto(user));
        }
        catch (Exception ex)
        {
            return Result.Fail<UserResponseDto>("Failed to retrieve user").WithError(ex.Message);
        }
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
            return Result.Fail("Failed to create user").WithError(ex.Message);
        }
    }

    public async Task<Result<UserResponseDto>> UpdateUserAsync(string id, UpdateUserDto updatedUser)
    {
        try
        {
            var updateDefinition = Builders<User>
                .Update.Set(u => u.DisplayName, updatedUser.DisplayName)
                .Set(u => u.Email, updatedUser.Email);

            var result = await _context.Users.UpdateOneAsync(
                user => user.Id == id,
                updateDefinition
            );

            if (result.MatchedCount == 0)
            {
                return Result.Fail<UserResponseDto>("User not found");
            }

            var user = await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();

            return Result.Ok(_mapper.ToDto(user!));
        }
        catch (Exception ex)
        {
            return Result.Fail<UserResponseDto>("Failed to update user").WithError(ex.Message);
        }
    }

    public async Task<Result<bool>> DeleteUserAsync(string id)
    {
        try
        {
            var result = await _context.Users.DeleteOneAsync(user => user.Id == id);

            if (result.DeletedCount == 0)
            {
                return Result.Fail<bool>("User not found");
            }

            return Result.Ok(true);
        }
        catch (Exception ex)
        {
            return Result.Fail<bool>("Failed to delete user").WithError(ex.Message);
        }
    }
}
