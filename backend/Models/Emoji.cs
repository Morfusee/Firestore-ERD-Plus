using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models;

public class Emoji
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("emoji")]
    public required string EmojiChar { get; set; }

    [BsonElement("hexcode")]
    public required string Hexcode { get; set; }

    [BsonElement("group")]
    public required string Group { get; set; }

    [BsonElement("subgroup")]
    public required string Subgroup { get; set; }

    [BsonElement("annotation")]
    public required string Annotation { get; set; }

    [BsonElement("tags")]
    public required List<string> Tags { get; set; }

    [BsonElement("shortcodes")]
    public required List<string> Shortcodes { get; set; }

    [BsonElement("emoticons")]
    public required List<string> Emoticons { get; set; }

    [BsonElement("directional")]
    public required bool Directional { get; set; }

    [BsonElement("variation")]
    public required bool Variation { get; set; }

    [BsonElement("variationBase")]
    public string? VariationBase { get; set; }

    [BsonElement("unicode")]
    public required double Unicode { get; set; }

    [BsonElement("order")]
    public required int Order { get; set; }
}
