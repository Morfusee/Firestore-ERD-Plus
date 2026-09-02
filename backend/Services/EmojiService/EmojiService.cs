using backend.Common.Attributes;
using backend.Common.Extensions;
using backend.DTOs.Common;
using backend.DTOs.Emoji;
using backend.Mappers;
using backend.Models;
using FluentResults;
using MongoDB.Driver;

namespace backend.Services.EmojiService;

[ScopedService]
public class EmojiService(MongoDbContext context, EmojiMapper mapper) : IEmojiService
{
    private static readonly HashSet<string> KnownGroups =
    [
        "smileys-emotion",
        "people-body",
        "animals-nature",
        "food-drink",
        "travel-places",
        "activities",
        "objects",
        "symbols",
        "component",
    ];

    private readonly MongoDbContext _context = context;
    private readonly EmojiMapper _mapper = mapper;

    public async Task<Result<PaginatedResponseDto<EmojiResponseDto>>> GetAllEmojisAsync(
        PaginationDto pagination,
        string? group = null
    )
    {
        try
        {
            if (!string.IsNullOrWhiteSpace(group) && !KnownGroups.Contains(group))
            {
                return Result.Fail<PaginatedResponseDto<EmojiResponseDto>>(
                    new Error($"Unknown emoji group '{group}'").WithMetadata(
                        "ValidationError",
                        true
                    )
                );
            }

            var filter = string.IsNullOrWhiteSpace(group)
                ? FilterDefinition<Emoji>.Empty
                : Builders<Emoji>.Filter.Eq(e => e.Group, group);

            var emojis = await _context
                .Emojis.Find(filter)
                .ToPaginatedListAsync(pagination, emoji => _mapper.ToDto(emoji));

            return Result.Ok(emojis);
        }
        catch (Exception ex)
        {
            return Result
                .Fail<PaginatedResponseDto<EmojiResponseDto>>("Failed to retrieve emojis")
                .WithError(ex.Message);
        }
    }

    public async Task<Result<EmojiResponseDto?>> GetEmojiByHexcodeAsync(string hexcode)
    {
        try
        {
            var emoji = await _context.Emojis.Find(e => e.Hexcode == hexcode).FirstOrDefaultAsync();

            if (emoji == null)
            {
                return Result.Ok<EmojiResponseDto?>(null);
            }

            return Result.Ok<EmojiResponseDto?>(_mapper.ToDto(emoji));
        }
        catch (Exception ex)
        {
            return Result
                .Fail<EmojiResponseDto?>("Failed to retrieve emoji by hexcode")
                .WithError(ex.Message);
        }
    }

    public async Task<Result<bool>> DeleteAllEmojisAsync()
    {
        try
        {
            var result = await _context.Emojis.DeleteManyAsync(FilterDefinition<Emoji>.Empty);
            return Result.Ok(result.DeletedCount > 0);
        }
        catch (Exception ex)
        {
            return Result.Fail<bool>("Failed to delete all emojis").WithError(ex.Message);
        }
    }
}
