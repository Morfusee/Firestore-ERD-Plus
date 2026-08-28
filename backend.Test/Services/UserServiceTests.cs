using backend.DTOs.Common;
using backend.DTOs.Settings;
using backend.DTOs.User;
using backend.Mappers;
using backend.Models;
using backend.Services.SettingsService;
using backend.Services.UserService;
using FluentResults;
using MongoDB.Driver;
using Moq;

namespace backend.Test.Services;

public class UserServiceTests : TestDBContext
{
    private readonly Mock<ISettingsService> _settingsService = new();

    private IUserService CreateService() =>
        new UserService(_mongoDbContext, _settingsService.Object, new UserMapper());

    private static CreateUserDto NewUser(string email = "new@example.com") =>
        new()
        {
            Email = email,
            Username = "new-user",
            DisplayName = "New User",
        };

    [Fact]
    public async Task GetAllUsersAsync_ReturnsPaginatedMappedUsers()
    {
        var result = await CreateService()
            .GetAllUsersAsync(new PaginationDto { Page = 1, Limit = 1 });

        Assert.True(result.IsSuccess);
        Assert.Equal(1, result.Value.TotalCount);
        Assert.Single(result.Value.Items!);
        Assert.Equal(MockUser.Email, result.Value.Items!.Single().Email);
    }

    [Fact]
    public async Task GetUserByIdAsync_ExistingUser_ReturnsUser()
    {
        var result = await CreateService().GetUserByIdAsync(MockUser.Id);

        Assert.True(result.IsSuccess);
        Assert.Equal(MockUser.Email, result.Value.Email);
    }

    [Fact]
    public async Task GetUserByIdAsync_MissingUser_ReturnsFailure()
    {
        var result = await CreateService().GetUserByIdAsync("507f1f77bcf86cd799439012");

        Assert.True(result.IsFailed);
        Assert.Contains("User not found", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task GetUserByEmailAsync_ExistingUser_ReturnsUser()
    {
        var result = await CreateService().GetUserByEmailAsync(MockUser.Email);

        Assert.True(result.IsSuccess);
        Assert.Equal(MockUser.Id, result.Value.Id);
    }

    [Fact]
    public async Task GetUserByEmailAsync_MissingUser_ReturnsFailure()
    {
        var result = await CreateService().GetUserByEmailAsync("missing@example.com");

        Assert.True(result.IsFailed);
        Assert.Contains("User not found", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task CreateUserAsync_SettingsCreated_ReturnsAndPersistsUser()
    {
        _settingsService
            .Setup(s => s.CreateSettingsAsync(It.IsAny<CreateSettingsDto>()))
            .ReturnsAsync(Result.Ok(new SettingsResponseDto()));
        var dto = NewUser();

        var result = await CreateService().CreateUserAsync(dto);

        Assert.True(result.IsSuccess);
        Assert.Equal(dto.Email, result.Value.Email);
        Assert.NotNull(
            await _mongoDbContext.Users.Find(u => u.Email == dto.Email).FirstOrDefaultAsync()
        );
        _settingsService.Verify(
            s => s.CreateSettingsAsync(It.Is<CreateSettingsDto>(x => x.Email == dto.Email)),
            Times.Once
        );
    }

    [Fact]
    public async Task CreateUserAsync_SettingsFailure_RollsBackInsertedUser()
    {
        _settingsService
            .Setup(s => s.CreateSettingsAsync(It.IsAny<CreateSettingsDto>()))
            .ReturnsAsync(Result.Fail<SettingsResponseDto>("settings failed"));
        var dto = NewUser("rollback@example.com");

        var result = await CreateService().CreateUserAsync(dto);

        Assert.True(result.IsFailed);
        Assert.Contains(
            "Failed to create default settings for the new user",
            result.Errors.Select(e => e.Message)
        );
        Assert.Null(
            await _mongoDbContext.Users.Find(u => u.Email == dto.Email).FirstOrDefaultAsync()
        );
    }

    [Fact]
    public async Task UpdateUserAsync_ExistingUser_UpdatesEmailAndDisplayName()
    {
        var dto = new UpdateUserDto { Email = "updated@example.com", DisplayName = "Updated" };

        var result = await CreateService().UpdateUserAsync(MockUser.Id, dto);

        Assert.True(result.IsSuccess);
        Assert.Equal(dto.Email, result.Value.Email);
        Assert.Equal(dto.DisplayName, result.Value.DisplayName);
    }

    [Fact]
    public async Task UpdateUserAsync_MissingUser_ReturnsFailure()
    {
        var result = await CreateService()
            .UpdateUserAsync(
                "507f1f77bcf86cd799439012",
                new UpdateUserDto { Email = "updated@example.com" }
            );

        Assert.True(result.IsFailed);
        Assert.Contains("User not found", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task DeleteUserAsync_ExistingUser_DeletesUserAndSettings()
    {
        var result = await CreateService().DeleteUserAsync(MockUser.Id);

        Assert.True(result.IsSuccess);
        Assert.True(result.Value);
        Assert.Null(
            await _mongoDbContext.Users.Find(u => u.Id == MockUser.Id).FirstOrDefaultAsync()
        );
        Assert.Empty(
            await _mongoDbContext.Settings.Find(s => s.UserId == MockUser.Id).ToListAsync()
        );
    }

    [Fact]
    public async Task DeleteUserAsync_MissingUser_ReturnsFailure()
    {
        var result = await CreateService().DeleteUserAsync("507f1f77bcf86cd799439012");

        Assert.True(result.IsFailed);
        Assert.Contains("User not found", result.Errors.Select(e => e.Message));
    }
}
