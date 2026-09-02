namespace backend.DTOs.User;

public class UserSearchResultDto
{
    public string Id { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? ProfilePicture { get; set; }
}
