using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Common;

/// <summary>
/// Base pagination request parameters
/// </summary>
public class PaginationDto
{
    /// <summary>
    /// Page number (1-indexed)
    /// </summary>
    [Range(1, int.MaxValue)]
    public int Page { get; set; } = 1;

    /// <summary>
    /// Maximum number of items to return per page (limit)
    /// </summary>
    [Range(1, 50)]
    public int Limit { get; set; } = 10;

    /// <summary>
    /// Calculated skip value based on page number
    /// </summary>
    public int Skip => (Page - 1) * Limit;
}
