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
    private readonly MongoDbContext _context = context;
    private readonly EmojiMapper _mapper = mapper;

    public async Task<Result<PaginatedResponseDto<EmojiResponseDto>>> GetAllEmojisAsync(
        PaginationDto pagination
    )
    {
        try
        {
            var emojis = await _context
                .Emojis.Find(_ => true)
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
