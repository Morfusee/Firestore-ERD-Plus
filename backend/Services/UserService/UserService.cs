using backend.Common.Attributes;
using backend.Common.Extensions;
using backend.DTOs.Common;
using backend.DTOs.Settings;
using backend.DTOs.User;
using backend.Mappers;
using backend.Models;
using backend.Services.SettingsService;
using FluentResults;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Text.RegularExpressions;

namespace backend.Services.UserService;

[ScopedService]
public class UserService(
    MongoDbContext context,
    ISettingsService settingsService,
    UserMapper mapper
) : IUserService
{
    private readonly MongoDbContext _context = context;
    private readonly ISettingsService _settingsService = settingsService;
    private readonly UserMapper _mapper = mapper;

    public async Task<Result<PaginatedResponseDto<UserResponseDto>>> GetAllUsersAsync(
        PaginationDto pagination
    )
    {
        try
        {
            var users = await _context
                .Users.Find(_ => true)
                .ToPaginatedListAsync(pagination, user => _mapper.ToDto(user));

            return Result.Ok(users);
        }
        catch (Exception ex)
        {
            return Result
                .Fail<PaginatedResponseDto<UserResponseDto>>("Failed to retrieve users")
                .WithError(ex.Message);
        }
    }

    public async Task<Result<UserResponseDto>> GetUserByIdAsync(string id)
    {
        try
        {
            var user = await _context.Users.Find(user => user.Id == id).FirstOrDefaultAsync();
            return user == null
                ? ResultExtensions.NotFound<UserResponseDto>("User not found")
                : Result.Ok(_mapper.ToDto(user));
        }
        catch (Exception ex)
        {
            return Result.Fail<UserResponseDto>("Failed to retrieve user").WithError(ex.Message);
        }
    }

    public async Task<Result<UserResponseDto>> GetUserByEmailAsync(string email)
    {
        try
        {
            var user = await _context.Users.Find(user => user.Email == email).FirstOrDefaultAsync();

            return user == null
                ? ResultExtensions.NotFound<UserResponseDto>("User not found")
                : Result.Ok(_mapper.ToDto(user));
        }
        catch (Exception ex)
        {
            return Result.Fail<UserResponseDto>("Failed to retrieve user").WithError(ex.Message);
        }
    }

    public async Task<Result<UserSearchResponseDto>> SearchUsersAsync(UserSearchDto search)
    {
        try
        {
            // Escape the query so regex metacharacters are matched literally.
            var pattern = new BsonRegularExpression(Regex.Escape(search.Username ?? ""), "i");
            var filter = Builders<User>.Filter.Regex(u => u.Username, pattern);

            if (search.ExcludedUsers is { Count: > 0 })
            {
                filter &= Builders<User>.Filter.Nin(u => u.Username, search.ExcludedUsers);
            }

            var users = await _context
                .Users.Find(filter)
                .SortBy(u => u.Username)
                .Limit(search.Limit)
                .ToListAsync();

            return Result.Ok(
                new UserSearchResponseDto
                {
                    Users = users.Select(_mapper.ToSearchResultDto).ToList(),
                }
            );
        }
        catch (Exception ex)
        {
            return Result.Fail<UserSearchResponseDto>("Failed to search users").WithError(ex.Message);
        }
    }

    public async Task<Result<UserResponseDto>> CreateUserAsync(CreateUserDto user)
    {
        try
        {
            var newUser = _mapper.ToUser(user);
            await _context.Users.InsertOneAsync(newUser);

            // Automatically create default settings for the new user
            var defaultSettings = new CreateSettingsDto { Email = newUser.Email };

            var createdSettings = await _settingsService.CreateSettingsAsync(defaultSettings);

            if (createdSettings.IsFailed)
            {
                // Rollback user creation if settings creation fails
                await _context.Users.DeleteOneAsync(u => u.Id == newUser.Id);

                return Result
                    .Fail<UserResponseDto>("Failed to create default settings for the new user")
                    .WithErrors(createdSettings.Errors);
            }

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
                return ResultExtensions.NotFound<UserResponseDto>("User not found");
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
                return ResultExtensions.NotFound<bool>("User not found");
            }

            // Also delete associated settings
            await _context.Settings.DeleteManyAsync(s => s.UserId == id);

            return Result.Ok(true);
        }
        catch (Exception ex)
        {
            return Result.Fail<bool>("Failed to delete user").WithError(ex.Message);
        }
    }
}
