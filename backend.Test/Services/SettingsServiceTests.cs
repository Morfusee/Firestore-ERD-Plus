using backend.DTOs.Common;
using backend.DTOs.Settings;
using backend.Mappers;
using backend.Models;
using backend.Services.SettingsService;
using MongoDB.Driver;

namespace backend.Test.Services;

public class SettingsServiceTests : TestDBContext
{
    private readonly ISettingsService _settingsService;

    public SettingsServiceTests()
    {
        _settingsService = new SettingsService(_mongoDbContext, new SettingsMapper());
    }

    [Fact]
    public async Task CreateSettingsAsync_WithValidData_ShouldCreateSettings()
    {
        // Arrange
        var createSettingsDto = new CreateSettingsDto
        {
            Email = MockUser.Email,
            AutoSaveInterval = 1,
            CanvasBackground = CanvasBackgroundOptions.Lines,
            Theme = ThemeOptions.Light,
        };

        // Act
        var result = await _settingsService.CreateSettingsAsync(createSettingsDto);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(ThemeOptions.Light, result.Value.Theme);
        Assert.Equal(CanvasBackgroundOptions.Lines, result.Value.CanvasBackground);
        Assert.Equal(1, result.Value.AutoSaveInterval);
    }

    [Fact]
    public async Task CreateSettingsAsync_WithPartialValidData_ShouldCreateSettings()
    {
        // Arrange
        var createSettingsDto = new CreateSettingsDto { Email = MockUser.Email };

        // Act
        var result = await _settingsService.CreateSettingsAsync(createSettingsDto);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(ThemeOptions.Dark, result.Value.Theme);
        Assert.Equal(CanvasBackgroundOptions.Dots, result.Value.CanvasBackground);
        Assert.Equal(0, result.Value.AutoSaveInterval);
    }

    [Fact]
    public async Task CreateSettingsAsync_WithInvalidEmail_ShouldReturnFailure()
    {
        // Arrange
        var createSettingsDto = new CreateSettingsDto { Email = "invalidemail@email.com" };

        // Act
        var result = await _settingsService.CreateSettingsAsync(createSettingsDto);

        // Assert
        Assert.True(result.IsFailed);
        Assert.Contains("User not found", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task GetSettingsByEmailAsync_WithValidEmail_ShouldReturnSettings()
    {
        // Arrange
        var emailDto = new EmailDto { Email = MockUser.Email };

        // Act
        var result = await _settingsService.GetSettingsByEmailAsync(emailDto);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(ThemeOptions.Dark, result.Value.Theme);
        Assert.Equal(CanvasBackgroundOptions.Dots, result.Value.CanvasBackground);
        Assert.Equal(0, result.Value.AutoSaveInterval);
    }

    [Fact]
    public async Task GetSettingsByEmailAsync_WithInvalidEmail_ShouldReturnFailure()
    {
        // Arrange
        var emailDto = new EmailDto { Email = "invalid@email.com" };

        // Act
        var result = await _settingsService.GetSettingsByEmailAsync(emailDto);

        // Assert
        Assert.True(result.IsFailed);
        Assert.Contains("User not found", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task UpdateSettingsAsync_WithValidData_ShouldUpdateSettings()
    {
        // Arrange
        var updateSettingsDto = new UpdateSettingsDto
        {
            Email = MockUser.Email,
            Theme = ThemeOptions.Light,
            CanvasBackground = CanvasBackgroundOptions.Lines,
            AutoSaveInterval = 5,
        };

        // Act
        var result = await _settingsService.UpdateSettingsAsync(updateSettingsDto);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(ThemeOptions.Light, result.Value.Theme);
        Assert.Equal(CanvasBackgroundOptions.Lines, result.Value.CanvasBackground);
        Assert.Equal(5, result.Value.AutoSaveInterval);
    }

    [Fact]
    public async Task UpdateSettingsAsync_WithInvalidEmail_ShouldReturnFailure()
    {
        // Arrange
        var updateSettingsDto = new UpdateSettingsDto
        {
            Email = "invalid@email.com",
            Theme = ThemeOptions.Light,
            CanvasBackground = CanvasBackgroundOptions.Lines,
            AutoSaveInterval = 5,
        };

        // Act
        var result = await _settingsService.UpdateSettingsAsync(updateSettingsDto);

        // Assert
        Assert.True(result.IsFailed);
        Assert.Contains("User not found", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task GetSettingsByEmailAsync_UserWithoutSettings_ReturnsSettingsNotFound()
    {
        await _mongoDbContext.Settings.DeleteManyAsync(s => s.UserId == MockUser.Id);

        var result = await _settingsService.GetSettingsByEmailAsync(
            new EmailDto { Email = MockUser.Email }
        );

        Assert.True(result.IsFailed);
        Assert.Contains("Settings not found", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task UpdateSettingsAsync_UserWithoutSettings_ReturnsSettingsNotFound()
    {
        await _mongoDbContext.Settings.DeleteManyAsync(s => s.UserId == MockUser.Id);

        var result = await _settingsService.UpdateSettingsAsync(
            new UpdateSettingsDto { Email = MockUser.Email, Theme = ThemeOptions.Light }
        );

        Assert.True(result.IsFailed);
        Assert.Contains("Settings not found", result.Errors.Select(e => e.Message));
    }

    [Fact]
    public async Task UpdateSettingsAsync_PartialUpdate_PreservesUnspecifiedValues()
    {
        var result = await _settingsService.UpdateSettingsAsync(
            new UpdateSettingsDto { Email = MockUser.Email, AutoSaveInterval = 12 }
        );

        Assert.True(result.IsSuccess);
        Assert.Equal(12, result.Value.AutoSaveInterval);
        Assert.Equal(ThemeOptions.Dark, result.Value.Theme);
        Assert.Equal(CanvasBackgroundOptions.Dots, result.Value.CanvasBackground);
    }
}
