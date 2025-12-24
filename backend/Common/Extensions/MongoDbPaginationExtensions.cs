using backend.DTOs.Common;
using MongoDB.Driver;

namespace backend.Common.Extensions;

/// <summary>
/// Extension methods for MongoDB pagination (Prisma-style)
/// </summary>
public static class MongoDbPaginationExtensions
{
    /// <summary>
    /// Applies pagination to a MongoDB find fluent interface
    /// </summary>
    /// <typeparam name="T">The document type</typeparam>
    /// <param name="findFluent">The MongoDB find fluent</param>
    /// <param name="pagination">Pagination parameters</param>
    /// <returns>Paginated find fluent</returns>
    public static IFindFluent<T, T> Paginate<T>(
        this IFindFluent<T, T> query,
        PaginationDto pagination
    )
    {
        return query.Skip(pagination.Skip).Limit(pagination.Take);
    }

    /// <summary>
    /// Executes a paginated query and returns results with metadata
    /// </summary>
    /// <typeparam name="TDocument">The MongoDB document type</typeparam>
    /// <typeparam name="TDto">The DTO type to return</typeparam>
    /// <param name="findFluent">The MongoDB find fluent</param>
    /// <param name="pagination">Pagination parameters</param>
    /// <param name="mapper">Function to map document to DTO</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated response with items and metadata</returns>
    public static async Task<PaginatedResponseDto<TDto>> ToPaginatedListAsync<TDocument, TDto>(
        this IFindFluent<TDocument, TDocument> query,
        PaginationDto pagination,
        Func<TDocument, Task<TDto>> mapper,
        CancellationToken cancellationToken = default
    )
    {
        // Get total count
        var totalCount = await query.CountDocumentsAsync(cancellationToken);

        // Get paginated items
        var documents = await query
            .Skip(pagination.Skip)
            .Limit(pagination.Take)
            .ToListAsync(cancellationToken);

        // Map to DTOs
        var items = await Task.WhenAll(documents.Select(mapper));

        return new PaginatedResponseDto<TDto>
        {
            Items = items,
            TotalCount = totalCount,
            Skip = pagination.Skip,
            Take = pagination.Take,
        };
    }

    /// <summary>
    /// Executes a paginated query and returns results with metadata (synchronous mapper)
    /// </summary>
    /// <typeparam name="TDocument">The MongoDB document type</typeparam>
    /// <typeparam name="TDto">The DTO type to return</typeparam>
    /// <param name="findFluent">The MongoDB find fluent</param>
    /// <param name="pagination">Pagination parameters</param>
    /// <param name="mapper">Function to map document to DTO</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated response with items and metadata</returns>
    public static async Task<PaginatedResponseDto<TDto>> ToPaginatedListAsync<TDocument, TDto>(
        this IFindFluent<TDocument, TDocument> query,
        PaginationDto pagination,
        Func<TDocument, TDto> mapper,
        CancellationToken cancellationToken = default
    )
    {
        // Get total count
        var totalCount = await query.CountDocumentsAsync(cancellationToken);

        // Get paginated items
        var documents = await query
            .Skip(pagination.Skip)
            .Limit(pagination.Take)
            .ToListAsync(cancellationToken);

        // Map to DTOs
        var items = documents.Select(mapper);

        return new PaginatedResponseDto<TDto>
        {
            Items = items,
            TotalCount = totalCount,
            Skip = pagination.Skip,
            Take = pagination.Take,
        };
    }
}
