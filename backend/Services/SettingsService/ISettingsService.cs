using backend.DTOs.Common;
using backend.DTOs.Settings;
using backend.Models;
using FluentResults;

namespace backend.Services.SettingsService;

public interface ISettingsService
{
    Task<Result<SettingsResponseDto>> GetSettingsByEmailAsync(EmailDto emailDto);
    Task<Result<SettingsResponseDto>> CreateSettingsAsync(CreateSettingsDto createSettingsDto);
    Task<Result<SettingsResponseDto>> UpdateSettingsAsync(UpdateSettingsDto updateSettingsDto);
}
