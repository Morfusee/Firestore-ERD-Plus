using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Common;

/// <summary>
/// Base pagination request parameters
/// </summary>
public class PaginationDto
{
    /// <summary>
    /// Number of items to skip
    /// </summary>
    [Range(0, int.MaxValue)]
    public int Skip { get; set; } = 0;

    /// <summary>
    /// Maximum number of items to return (limit)
    /// </summary>
    [Range(1, 50)]
    public int Take { get; set; } = 10;
}
