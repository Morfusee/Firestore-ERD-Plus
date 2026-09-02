using backend.Common.Extensions;
using backend.Common.Models;
using backend.DTOs.Common;
using backend.DTOs.Emoji;
using backend.Services.EmojiService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmojisController(IEmojiService emojiService, ILogger<EmojisController> logger)
    : ControllerBase
{
    private readonly IEmojiService _emojiService = emojiService;
    private readonly ILogger<EmojisController> _logger = logger;

    [HttpGet]
    public async Task<
        ActionResult<ApiResponse<PaginatedResponseDto<EmojiResponseDto>>>
    > GetAllEmojis([FromQuery] PaginationDto pagination, [FromQuery] string? group)
    {
        var emojis = await _emojiService.GetAllEmojisAsync(pagination, group);

        return this.ToApiResponse(emojis);
    }

    [HttpGet("{hexcode}")]
    public async Task<ActionResult<ApiResponse<EmojiResponseDto?>>> GetEmojiByHexcode(
        [FromRoute(Name = "hexcode")] string hexcode
    )
    {
        var emoji = await _emojiService.GetEmojiByHexcodeAsync(hexcode);

        return this.ToApiResponse(emoji);
    }

    [HttpDelete]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteAllEmojis()
    {
        var result = await _emojiService.DeleteAllEmojisAsync();

        return this.ToApiResponse(result);
    }
}
