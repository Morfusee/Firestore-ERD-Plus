using backend.DTOs.Common;
using backend.DTOs.Emoji;
using FluentResults;

namespace backend.Services.EmojiService;

public interface IEmojiService
{
    Task<Result<PaginatedResponseDto<EmojiResponseDto>>> GetAllEmojisAsync(
        PaginationDto pagination
    );
    Task<Result<EmojiResponseDto?>> GetEmojiByHexcodeAsync(string hexcode);
    Task<Result<bool>> DeleteAllEmojisAsync();
}
