using backend.Common.Attributes;
using backend.DTOs.User;
using backend.Models;
using Riok.Mapperly.Abstractions;

namespace backend.Mappers;

[Mapper(RequiredMappingStrategy = RequiredMappingStrategy.Source)]
[SingletonService]
public partial class UserMapper
{
    public partial User ToUser(CreateUserDto dto);

    public partial User ToUser(UpdateUserDto dto);

    public partial User ToUser(UserResponseDto dto);

    [MapperIgnoreSource(nameof(User.Projects))]
    public partial UserResponseDto ToDto(User user);

    public partial void UpdateUser(UpdateUserDto dto, UserResponseDto user);
}
