namespace backend_asp.DTOs.User;

public class UserResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? ProfilePicture { get; set; }
    public List<string> OwnedProjects { get; set; } = [];
    public List<string> SharedProjects { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
