using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace backend_asp.Models;

public class Version
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    [Required]
    public string Name { get; set; } = string.Empty;

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("project")]
    [BsonRepresentation(BsonType.ObjectId)]
    [Required]
    public string ProjectId { get; set; } = string.Empty;

    [BsonElement("currentHistory")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CurrentHistoryId { get; set; }

    [BsonElement("createdAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [BsonIgnore]
    public Project? Project { get; set; }

    [BsonIgnore]
    public History? CurrentHistory { get; set; }
}

public class History
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("version")]
    [BsonRepresentation(BsonType.ObjectId)]
    [Required]
    public string VersionId { get; set; } = string.Empty;

    [BsonElement("data")]
    [Required]
    public string Data { get; set; } = string.Empty;

    [BsonElement("members")]
    public List<Member> Members { get; set; } = [];

    [BsonElement("isRollback")]
    public bool IsRollback { get; set; } = false;

    [BsonElement("createdAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [BsonIgnore]
    public Version? Version { get; set; }
}
