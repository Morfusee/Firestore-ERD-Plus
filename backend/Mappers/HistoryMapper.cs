using backend.Common.Attributes;
using backend.DTOs.History;
using Riok.Mapperly.Abstractions;

namespace backend.Mappers;

[Mapper(RequiredMappingStrategy = RequiredMappingStrategy.Source)]
[SingletonService]
public partial class HistoryMapper
{
    public partial VersionResponseDto ToDto(Models.Version version);

    public partial HistoryResponseDto ToDto(Models.History history);
}
