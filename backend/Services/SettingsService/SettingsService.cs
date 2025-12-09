using backend.Common.Attributes;
using backend.DTOs.Common;
using backend.DTOs.Settings;
using backend.DTOs.User;
using backend.Mappers;
using backend.Models;
using FluentResults;
using MongoDB.Driver;

namespace backend.Services.SettingsService;

[ScopedService]
public class SettingsService(MongoDbContext context, SettingsMapper mapper) : ISettingsService
{
    private readonly MongoDbContext _context = context;
    private readonly SettingsMapper _mapper = mapper;

    public async Task<Result<SettingsResponseDto>> CreateSettingsAsync(
        CreateSettingsDto createSettingsDto
    )
    {
        try
        {
            var user = await _context
                .Users.Find(u => u.Email == createSettingsDto.Email)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return Result.Fail<SettingsResponseDto>("User not found");
            }

            var settings = _mapper.ToSettings(createSettingsDto, user.Id);

            await _context.Settings.InsertOneAsync(settings);

            return Result.Ok(_mapper.ToDto(settings));
        }
        catch (Exception ex)
        {
            return Result
                .Fail<SettingsResponseDto>("Failed to create settings")
                .WithError(ex.Message);
        }
    }

    public async Task<Result<SettingsResponseDto>> GetSettingsByEmailAsync(EmailDto emailDto)
    {
        try
        {
            var user = await _context
                .Users.Find(u =>
                    u.Email.Equals(emailDto.Email, StringComparison.CurrentCultureIgnoreCase)
                )
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return Result.Fail<SettingsResponseDto>("User not found");
            }

            var settings = await _context
                .Settings.Find(s => s.UserId == user.Id)
                .FirstOrDefaultAsync();

            return settings == null
                ? Result.Fail<SettingsResponseDto>("Settings not found")
                : Result.Ok(_mapper.ToDto(settings));
        }
        catch (Exception ex)
        {
            return Result
                .Fail<SettingsResponseDto>("Failed to retrieve settings")
                .WithError(ex.Message);
        }
    }

    public async Task<Result<SettingsResponseDto>> UpdateSettingsAsync(
        UpdateSettingsDto updateSettingsDto
    )
    {
        try
        {
            var user = await _context
                .Users.Find(u => u.Email == updateSettingsDto.Email)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return Result.Fail<SettingsResponseDto>("User not found");
            }

            var settings = await _context
                .Settings.Find(u => u.UserId == user.Id)
                .FirstOrDefaultAsync();

            if (settings == null)
            {
                return Result.Fail<SettingsResponseDto>("Settings not found");
            }

            settings.UpdatedAt = DateTime.UtcNow;

            _mapper.UpdateSettings(updateSettingsDto, settings);

            var filter = Builders<Settings>.Filter.Eq(s => s.Id, settings.Id);

            await _context.Settings.ReplaceOneAsync(filter, settings);

            return Result.Ok(_mapper.ToDto(settings));
        }
        catch (Exception ex)
        {
            return Result
                .Fail<SettingsResponseDto>("Failed to update settings")
                .WithError(ex.Message);
        }
    }
}
