using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models;

public class Member
{
    [BsonElement("userId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("role")]
    [Required]
    public MemberRole Role { get; set; } = MemberRole.Viewer;

    [BsonIgnore]
    [JsonIgnore]
    public User? User { get; set; }
}

public enum MemberRole
{
    Owner,
    Editor,
    Viewer,
    Admin
}

public class GeneralAccess
{
    [BsonElement("accessType")]
    [Required]
    public GeneralAccessType AccessType { get; set; } = GeneralAccessType.Restricted;

    [BsonElement("role")]
    [Required]
    public MemberRole Role { get; set; } = MemberRole.Viewer;

    [BsonIgnore]
    [JsonIgnore]
    public List<User> Users { get; set; } = [];
}

public enum GeneralAccessType
{
    Restricted,
    Link
}

public class Project
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    [Required]
    public string Name { get; set; } = string.Empty;

    [BsonElement("icon")]
    [Required]
    public string Icon { get; set; } = string.Empty;

    [BsonElement("data")]
    public string? Data { get; set; }

    [BsonElement("members")]
    public List<Member> Members { get; set; } = [];

    [BsonElement("generalAccess")]
    public GeneralAccess GeneralAccess { get; set; } = new GeneralAccess();

    [BsonElement("createdAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}