using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace backend_asp.Models;

[BsonIgnoreExtraElements]
public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("username")]
    [Required]
    public string Username { get; set; } = string.Empty;

    [BsonElement("email")]
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [BsonElement("displayName")]
    public string? DisplayName { get; set; }

    [BsonElement("profilePicture")]
    public string? ProfilePicture { get; set; }

    [BsonElement("ownedProjects")]
    [BsonRepresentation(BsonType.ObjectId)]
    public List<string> OwnedProjects { get; set; } = [];

    [BsonElement("sharedProjects")]
    [BsonRepresentation(BsonType.ObjectId)]
    public List<string> SharedProjects { get; set; } = [];

    [BsonElement("createdAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [BsonIgnore]
    public List<Project> Projects { get; set; } = [];
}
