namespace backend.DTOs.User;

public class UserSearchResponseDto
{
    public IReadOnlyList<UserSearchResultDto> Users { get; set; } = [];
}
