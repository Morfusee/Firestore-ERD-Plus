using System.Text.Json.Serialization;

namespace backend.DTOs.Auth;

public class FirebaseRestResponse
{
    [JsonPropertyName("idToken")]
    public required string IdToken { get; set; }

    [JsonPropertyName("email")]
    public required string Email { get; set; }

    [JsonPropertyName("refreshToken")]
    public required string RefreshToken { get; set; }

    [JsonPropertyName("expiresIn")]
    public required string ExpiresIn { get; set; }

    [JsonPropertyName("localId")]
    public required string LocalId { get; set; }

    // Optional fields returned by Firebase
    [JsonPropertyName("displayName")]
    public string? DisplayName { get; set; }

    [JsonPropertyName("registered")]
    public bool? Registered { get; set; }
}
