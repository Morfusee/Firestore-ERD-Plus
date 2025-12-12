using backend.Common.Attributes;
using backend.DTOs.Settings;
using backend.Models;
using Riok.Mapperly.Abstractions;

namespace backend.Mappers;

[Mapper(RequiredMappingStrategy = RequiredMappingStrategy.Source)]
[SingletonService]
public partial class SettingsMapper
{
    [MapperIgnoreSource(nameof(Settings.User))]
    public partial SettingsResponseDto ToDto(Settings settings);

    [MapperIgnoreSource(nameof(CreateSettingsDto.Email))]
    public partial Settings ToSettings(CreateSettingsDto dto, string userId);

    [MapperIgnoreSource(nameof(UpdateSettingsDto.Email))]
    public partial void UpdateSettings(UpdateSettingsDto dto, Settings settings);
}
