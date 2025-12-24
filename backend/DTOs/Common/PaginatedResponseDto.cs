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
    /// Current page number (1-indexed)
    /// </summary>
    public int Page { get; set; }

    /// <summary>
    /// Maximum number of items per page
    /// </summary>
    public int Limit { get; set; }

    /// <summary>
    /// Total number of pages
    /// </summary>
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / Limit);

    /// <summary>
    /// Whether there is a next page available
    /// </summary>
    public bool HasNextPage => Page < TotalPages;

    /// <summary>
    /// Whether there is a previous page available
    /// </summary>
    public bool HasPreviousPage => Page > 1;
}
