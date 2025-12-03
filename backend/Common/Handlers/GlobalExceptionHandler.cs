using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace backend.Common.Handlers;

// Note: IProblemDetailsService is used for the modern approach to writing Problem Details JSON
internal sealed class GlobalExceptionHandler(
    IProblemDetailsService problemDetailsService,
    ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        logger.LogError(exception, "An unhandled, exceptional error occurred.");

        httpContext.Response.StatusCode = exception switch
        {
            // Handle common application exceptions
            KeyNotFoundException => StatusCodes.Status404NotFound,
            UnauthorizedAccessException => StatusCodes.Status401Unauthorized,

            // Default to 500 for all other unexpected errors/crashes
            _ => StatusCodes.Status500InternalServerError
        };

        var context = new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = new ProblemDetails
            {
                // Set the Title and Detail based on the error type
                Title = httpContext.Response.StatusCode == StatusCodes.Status500InternalServerError
                    ? "Internal Server Error"
                    : exception.GetType().Name.Replace("Exception", string.Empty),

                Detail = httpContext.Response.StatusCode == StatusCodes.Status500InternalServerError
                    ? "An unexpected error occurred. Please try again later."
                    : exception.Message,

                Status = httpContext.Response.StatusCode,
            }
        };
        return await problemDetailsService.TryWriteAsync(context);
    }

}