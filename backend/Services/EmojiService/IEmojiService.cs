using backend.DTOs.Emoji;
using FluentResults;

namespace backend.Services.EmojiService;

public interface IEmojiService
{
    Task<Result<IEnumerable<EmojiResponseDto>>> GetAllEmojisAsync();
    Task<Result<EmojiResponseDto?>> GetEmojiByHexcodeAsync(string hexcode);
    Task<Result<bool>> DeleteAllEmojisAsync();
}
