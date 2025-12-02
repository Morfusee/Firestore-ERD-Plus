using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend_asp.Models;

public class Settings
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("user")]
    [BsonRepresentation(BsonType.ObjectId)]
    [Required]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("autoSaveInterval")]
    public int AutoSaveInterval { get; set; } = 0;

    [BsonElement("canvasBackground")]
    public CanvasBackgroundOptions CanvasBackground { get; set; } = CanvasBackgroundOptions.Dots;

    [BsonElement("theme")]
    public ThemeOptions Theme { get; set; } = ThemeOptions.Light;

    [BsonElement("createdAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [BsonIgnore]
    [JsonIgnore]
    public User? User { get; set; }
}

public enum CanvasBackgroundOptions
{
    Dots,
    Lines,
    Cross
}

public enum ThemeOptions
{
    Light,
    Dark
}