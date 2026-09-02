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
    public async Task GetAllEmojisAsync_WithGroup_ShouldReturnOnlyMatchingEmojis()
    {
        // Arrange
        var pagination = new PaginationDto { Page = 1, Limit = 50 };

        // Act
        var result = await _emojiService.GetAllEmojisAsync(pagination, "smileys-emotion");

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Value.TotalCount);
        Assert.All(result.Value.Items, e => Assert.Equal("smileys-emotion", e.Group));
    }

    [Fact]
    public async Task GetAllEmojisAsync_WithUnknownGroup_ShouldReturnValidationFailure()
    {
        // Act
        var result = await _emojiService.GetAllEmojisAsync(new PaginationDto(), "space-travel");

        // Assert
        Assert.True(result.IsFailed);
        Assert.Contains(
            result.Errors,
            e => e.Metadata != null && e.Metadata.ContainsKey("ValidationError")
        );
    }

    [Fact]
    public async Task GetAllEmojisAsync_WithKnownGroupAndNoMatchingData_ShouldReturnEmptySuccess()
    {
        // Act
        var result = await _emojiService.GetAllEmojisAsync(new PaginationDto(), "component");

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Empty(result.Value.Items);
    }

    [Fact]
    public async Task GetAllEmojisAsync_WithGroupAndPaginationBoundaries_ShouldReturnCorrectPages()
    {
        // Act
        var firstPage = await _emojiService.GetAllEmojisAsync(
            new PaginationDto { Page = 1, Limit = 1 },
            "smileys-emotion"
        );
        var secondPage = await _emojiService.GetAllEmojisAsync(
            new PaginationDto { Page = 2, Limit = 1 },
            "smileys-emotion"
        );

        // Assert
        Assert.True(firstPage.IsSuccess);
        Assert.True(secondPage.IsSuccess);
        Assert.Single(firstPage.Value.Items);
        Assert.True(firstPage.Value.HasNextPage);
        Assert.Single(secondPage.Value.Items);
        Assert.False(secondPage.Value.HasNextPage);
        Assert.NotEqual(
            Assert.Single(firstPage.Value.Items).Hexcode,
            Assert.Single(secondPage.Value.Items).Hexcode
        );
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

    [Fact]
    public async Task DeleteAllEmojisAsync_WhenCollectionAlreadyEmpty_ReturnsFalse()
    {
        await _emojiService.DeleteAllEmojisAsync();

        var result = await _emojiService.DeleteAllEmojisAsync();

        Assert.True(result.IsSuccess);
        Assert.False(result.Value);
    }

    [Fact]
    public async Task GetEmojiByHexcodeAsync_UsesExactCaseSensitiveLookup()
    {
        var exact = await _emojiService.GetEmojiByHexcodeAsync("1F600");
        var differentCase = await _emojiService.GetEmojiByHexcodeAsync("1f600");

        Assert.True(exact.IsSuccess);
        Assert.NotNull(exact.Value);
        Assert.True(differentCase.IsSuccess);
        Assert.Null(differentCase.Value);
    }
}
