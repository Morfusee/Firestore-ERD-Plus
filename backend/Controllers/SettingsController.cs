using backend.Common.Extensions;
using backend.Common.Models;
using backend.DTOs.Common;
using backend.DTOs.Settings;
using backend.Services.SettingsService;
using FluentResults;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController(
    ISettingsService settingsService,
    ILogger<SettingsController> logger
) : ControllerBase
{
    private readonly ISettingsService _settingsService = settingsService;
    private readonly ILogger<SettingsController> _logger = logger;

    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<SettingsResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<SettingsResponseDto>>> GetSettingsByEmail(
        [FromQuery] EmailDto emailDto
    )
    {
        var settings = await _settingsService.GetSettingsByEmailAsync(emailDto);

        return this.ToApiResponse(settings);
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<SettingsResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<SettingsResponseDto>>> CreateSettings(
        [FromBody] CreateSettingsDto createSettingsDto
    )
    {
        var settings = await _settingsService.CreateSettingsAsync(createSettingsDto);

        return this.ToApiResponse(settings);
    }

    [HttpPut]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<SettingsResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<SettingsResponseDto>>> UpdateSettings(
        [FromBody] UpdateSettingsDto updateSettingsDto
    )
    {
        var settings = await _settingsService.UpdateSettingsAsync(updateSettingsDto);

        return this.ToApiResponse(settings);
    }
}
