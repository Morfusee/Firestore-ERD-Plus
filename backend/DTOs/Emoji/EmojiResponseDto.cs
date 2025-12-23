using System.Text.Json.Serialization;

namespace backend.DTOs.Emoji;

public class EmojiResponseDto
{
    [JsonPropertyName("_id")]
    public string? Id { get; set; }

    [JsonPropertyName("emoji")]
    public required string Emoji { get; set; }

    [JsonPropertyName("hexcode")]
    public required string Hexcode { get; set; }

    [JsonPropertyName("group")]
    public required string Group { get; set; }

    [JsonPropertyName("subgroup")]
    public required string Subgroup { get; set; }

    [JsonPropertyName("annotation")]
    public required string Annotation { get; set; }

    [JsonPropertyName("tags")]
    public required List<string> Tags { get; set; }

    [JsonPropertyName("shortcodes")]
    public required List<string> Shortcodes { get; set; }

    [JsonPropertyName("emoticons")]
    public required List<string> Emoticons { get; set; }

    [JsonPropertyName("directional")]
    public required bool Directional { get; set; }

    [JsonPropertyName("variation")]
    public required bool Variation { get; set; }

    [JsonPropertyName("variationBase")]
    public string? VariationBase { get; set; }

    [JsonPropertyName("unicode")]
    public required double Unicode { get; set; }

    [JsonPropertyName("order")]
    public required int Order { get; set; }
}
