using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.DTOs.Common;

public class ProjectIdDto
{
    [Required]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string Id { get; set; }
}
