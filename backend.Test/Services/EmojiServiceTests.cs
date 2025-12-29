using backend.DTOs.Common;
using backend.Mappers;
using backend.Models;
using backend.Services.EmojiService;
using MongoDB.Driver;

namespace backend.Test.Services;

public class EmojiServiceTests : TestDBContext
{
    private readonly IEmojiService _emojiService;

    public EmojiServiceTests()
    {
        _emojiService = new EmojiService(_mongoDbContext, new EmojiMapper());
    }

    [Fact]
    public async Task GetAllEmojisAsync_WithPagination_ShouldReturnEmojis()
    {
        // Arrange
        var pagination = new PaginationDto { Page = 1, Limit = 10 };

        // Act
        var result = await _emojiService.GetAllEmojisAsync(pagination);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.True(result.Value.TotalCount >= 0);
        Assert.True(result.Value.Limit == pagination.Limit);
        Assert.True(result.Value.Page == pagination.Page);
    }

    [Fact]
    public async Task GetAllEmojisAsync_WithInvalidPagination_ShouldReturnEmpty()
    {
        // Arrange
        var pagination = new PaginationDto { Page = 1000, Limit = 10 };

        // Act
        var result = await _emojiService.GetAllEmojisAsync(pagination);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Empty(result.Value.Items);
    }

    [Fact]
    public async Task GetEmojiByHexcodeAsync_WithValidHexcode_ShouldReturnEmoji()
    {
        // Arrange
        var hexcode = "1F600";

        // Act
        var result = await _emojiService.GetEmojiByHexcodeAsync(hexcode);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(hexcode, result.Value.Hexcode);
    }

    [Fact]
    public async Task GetEmojiByHexcodeAsync_WithInvalidHexcode_ShouldReturnEmpty()
    {
        // Arrange
        var hexcode = "1F622";

        // Act
        var result = await _emojiService.GetEmojiByHexcodeAsync(hexcode);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Null(result.Value);
    }

    [Fact]
    public async Task DeleteAllEmojisAsync_ShouldDeleteEmojis()
    {
        // Act
        var result = await _emojiService.DeleteAllEmojisAsync();

        // Assert
        Assert.True(result.IsSuccess);
        Assert.True(result.Value);

        // Verify that the emojis collection is empty
        var emojisCount = await _mongoDbContext.Emojis.CountDocumentsAsync(
            FilterDefinition<Emoji>.Empty
        );
        Assert.Equal(0, emojisCount);
    }
}
