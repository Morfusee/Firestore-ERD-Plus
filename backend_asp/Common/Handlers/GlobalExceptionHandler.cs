using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace backend_asp.Common.Handlers;

internal sealed class GlobalExceptionHandler(
    IProblemDetailsService problemDetailsService,
    ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        logger.LogError(exception, "Unhandled exception occurred.");

        httpContext.Response.StatusCode = exception switch
        {
            MongoWriteException => StatusCodes.Status409Conflict,
            KeyNotFoundException => StatusCodes.Status404NotFound,
            UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
            _ => StatusCodes.Status500InternalServerError
        };

        var context = new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = new ProblemDetails
            {
                Title = "One or more validation errors occurred.",
                Status = httpContext.Response.StatusCode,
            }
        };

        var errors = exception switch
        {
            MongoWriteException mongoWriteEx => ExtractMongoErrors(mongoWriteEx),
            _ => null
        };

        context.ProblemDetails.Extensions.Add("errors", errors);

        return await problemDetailsService.TryWriteAsync(context);
    }

    private static Dictionary<string, string[]> ExtractMongoErrors(MongoWriteException mongoWriteEx)
    {
        var writeError = mongoWriteEx.WriteError;

        // Handle duplicate key errors (code 11000)
        if (writeError.Code == 11000)
        {
            // Extract field name from error message
            // Example: "E11000 duplicate key error collection: db.users index: email_1 dup key: { email: \"test@example.com\" }"
            var message = writeError.Message;
            var indexMatch = Regex.Match(message, @"index: (\w+)_");
            var fieldName = indexMatch.Success ? indexMatch.Groups[1].Value : "field";

            return new Dictionary<string, string[]>
            {
                { fieldName.ToLowerInvariant(), new[] { $"The {fieldName} already exists." } }
            };
        }

        // Default error handling
        return new Dictionary<string, string[]>
        {
            { "database", new[] { writeError.Message } }
        };
    }
}
