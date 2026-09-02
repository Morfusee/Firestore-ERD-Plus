using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.User;

public class UserSearchDto
{
    [Required(AllowEmptyStrings = true)]
    public string? Username { get; set; }

    public List<string>? ExcludedUsers { get; set; }

    [Range(1, 25)]
    public int Limit { get; set; } = 5;
}
