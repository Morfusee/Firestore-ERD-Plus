
using backend.Common.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace backend.Common.Handlers;

public class ResponseWrapperFilter : IResultFilter
{
    public void OnResultExecuting(ResultExecutingContext context)
    {
        if (context.Result is ObjectResult objectResult)
        {
            // Skip wrapping for ProblemDetails (errors)
            if (objectResult.Value is ProblemDetails || objectResult.Value is ValidationProblemDetails)
            {
                return;
            }

            // If already wrapped, don't wrap again
            if (objectResult.Value?.GetType().IsGenericType == true && 
                objectResult.Value.GetType().GetGenericTypeDefinition() == typeof(ApiResponse<>))
            {
                return;
            }

            // Generate contextual message
            var message = GenerateMessage(context.HttpContext, objectResult.StatusCode);

            // Create the wrapper
            var response = new ApiResponse<object>(objectResult.Value ?? new object(), message);

            objectResult.Value = response;
        }
    }

    public void OnResultExecuted(ResultExecutedContext context)
    {
        // No action needed after execution
    }

    private static string GenerateMessage(HttpContext httpContext, int? statusCode)
    {
        var method = httpContext.Request.Method;
        var code = statusCode ?? StatusCodes.Status200OK;

        return (method, code) switch
        {
            ("GET", 200) => "Resource retrieved successfully",
            ("POST", 200 or 201) => "Resource created successfully",
            ("PUT", 200 or 204) => "Resource updated successfully",
            ("PATCH", 200 or 204) => "Resource updated successfully",
            ("DELETE", 200 or 204) => "Resource deleted successfully",
            _ => "Operation completed successfully"
        };
    }
}