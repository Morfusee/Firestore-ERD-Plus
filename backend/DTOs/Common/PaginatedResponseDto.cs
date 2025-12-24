namespace backend.DTOs.Common;

/// <summary>
/// Generic paginated response wrapper (Prisma-style)
/// </summary>
/// <typeparam name="T">The type of items being paginated</typeparam>
public class PaginatedResponseDto<T>
{
    /// <summary>
    /// The paginated items
    /// </summary>
    public required IEnumerable<T> Items { get; set; }

    /// <summary>
    /// Total count of items (across all pages)
    /// </summary>
    public long TotalCount { get; set; }

    /// <summary>
    /// Number of items skipped
    /// </summary>
    public int Skip { get; set; }

    /// <summary>
    /// Maximum number of items per page
    /// </summary>
    public int Take { get; set; }

    /// <summary>
    /// Whether there are more items available
    /// </summary>
    public bool HasMore => Skip + Items.Count() < TotalCount;

    /// <summary>
    /// Current page number (1-indexed)
    /// </summary>
    public int PageNumber => (Skip / Take) + 1;

    /// <summary>
    /// Total number of pages
    /// </summary>
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / Take);
}
