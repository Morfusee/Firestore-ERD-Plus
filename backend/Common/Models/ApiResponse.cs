using System.Text.Json.Serialization;

namespace backend.Common.Models;

public record ApiResponse<T>(
    T Data,
    string? Message = null,
    int Status = StatusCodes.Status200OK,
    bool IsSuccess = true,
    object? Errors = null
);
