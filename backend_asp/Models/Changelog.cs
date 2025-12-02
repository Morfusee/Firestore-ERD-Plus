using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend_asp.Models;

public class Changelog
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    public string? Name { get; set; }

    [BsonElement("project")]
    [BsonRepresentation(BsonType.ObjectId)]
    [Required]
    public string ProjectId { get; set; } = string.Empty;

    [BsonElement("data")]
    [Required]
    public string Data { get; set; } = string.Empty;

    [BsonElement("currentVersion")]
    [Required]
    public bool CurrentVersion { get; set; }

    [BsonElement("members")]
    public List<User> Members { get; set; } = [];

    [BsonElement("createdAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonIgnore]
    [JsonIgnore]
    public Project? Project { get; set; }
}
