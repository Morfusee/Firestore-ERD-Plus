using backend.Common.Attributes;
using backend.DTOs.Emoji;
using backend.DTOs.Project;
using backend.Models;
using Riok.Mapperly.Abstractions;

namespace backend.Mappers;

[Mapper(RequiredMappingStrategy = RequiredMappingStrategy.Source)]
[SingletonService]
public partial class EmojiMapper
{
    public Emoji ToModel(EmojiResponseDto dto)
    {
        return new Emoji
        {
            EmojiChar = dto.Emoji,
            Hexcode = dto.Hexcode,
            Group = dto.Group,
            Subgroup = dto.Subgroup,
            Annotation = dto.Annotation,
            Tags = dto.Tags,
            Shortcodes = dto.Shortcodes,
            Emoticons = dto.Emoticons,
            Directional = dto.Directional,
            Variation = dto.Variation,
            VariationBase = dto.VariationBase,
            Unicode = dto.Unicode,
            Order = dto.Order,
        };
    }

    public EmojiResponseDto ToDto(Emoji emoji)
    {
        return new EmojiResponseDto
        {
            Id = emoji.Id,
            Emoji = emoji.EmojiChar,
            Hexcode = emoji.Hexcode,
            Group = emoji.Group,
            Subgroup = emoji.Subgroup,
            Annotation = emoji.Annotation,
            Tags = emoji.Tags,
            Shortcodes = emoji.Shortcodes,
            Emoticons = emoji.Emoticons,
            Directional = emoji.Directional,
            Variation = emoji.Variation,
            VariationBase = emoji.VariationBase,
            Unicode = emoji.Unicode,
            Order = emoji.Order,
        };
    }
}
