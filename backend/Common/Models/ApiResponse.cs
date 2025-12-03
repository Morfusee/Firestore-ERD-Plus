using System.Text.Json.Serialization;

namespace backend.Common.Models;


public class ApiResponse<T>(T data, string? message = null, int status = StatusCodes.Status500InternalServerError, IDictionary<string, object?>? errors = null)
{
    public T Data { get; set; } = data;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Message { get; set; } = message;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int Status { get; set; } = status;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public IDictionary<string, object?> Errors { get; set; } = errors ?? new Dictionary<string, object?>();

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public object? Meta { get; set; } = null;
}