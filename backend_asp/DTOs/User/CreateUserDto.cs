namespace backend_asp.DTOs.User;

public class CreateUserDto
{
    public required string Username { get; set; } 
    public required string Email { get; set; }
}