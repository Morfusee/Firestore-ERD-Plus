using backend.Common.Models;
using FluentResults;
using Microsoft.AspNetCore.Mvc;

namespace backend.Common.Extensions;

public static class ResultExtensions
{
    public static Result<T> NotFound<T>(string message)
    {
        return Result.Fail<T>(new Error(message).WithMetadata("NotFound", true));
    }

    public static ActionResult<ApiResponse<T>> ToApiResponse<T>(
        this ControllerBase controller,
        Result<T> result,
        int successStatusCode = StatusCodes.Status200OK
    )
    {
        if (result.IsFailed)
        {
            var status = InferStatusCode(result);

            var errors = result
                .Errors.Select(e => new { Message = e.Message, Metadata = e.Metadata })
                .ToList();

            var response = new ApiResponse<T>(
                Data: default!,
                Message: result.Errors[0].Message,
                Status: status,
                Errors: errors,
                IsSuccess: false
            );

            return controller.StatusCode(status, response);
        }

        return controller.StatusCode(
            successStatusCode,
            new ApiResponse<T>(
                Data: result.Value!,
                Message: "Operation successful",
                Status: successStatusCode,
                IsSuccess: true
            )
        );
    }

    private static int InferStatusCode<T>(Result<T> result)
    {
        // Simple heuristic to determine status code based on error types
        if (result.Errors.Any(e => e.Metadata != null && e.Metadata.ContainsKey("NotFound")))
        {
            return StatusCodes.Status404NotFound;
        }

        if (result.Errors.Any(e => e.Metadata != null && e.Metadata.ContainsKey("Conflict")))
        {
            return StatusCodes.Status409Conflict;
        }

        if (result.Errors.Any(e => e.Metadata != null && e.Metadata.ContainsKey("ValidationError")))
        {
            return StatusCodes.Status400BadRequest;
        }

        return StatusCodes.Status500InternalServerError;
    }
}
