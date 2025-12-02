namespace backend.DTOs.User;

public class UpdateUserDto
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? ProfilePicture { get; set; }
}
