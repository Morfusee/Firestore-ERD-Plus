using backend.Common.Extensions;
using backend.Common.Models;
using FluentResults;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Test.Common;

public class ResultExtensionsTests
{
    private sealed class TestController : ControllerBase { }

    [Fact]
    public void ToApiResponse_Success_Returns200Envelope()
    {
        var action = new TestController().ToApiResponse(Result.Ok("value"));

        var response = Assert.IsType<ObjectResult>(action.Result);
        var body = Assert.IsType<ApiResponse<string>>(response.Value);
        Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
        Assert.Equal("value", body.Data);
        Assert.Equal("Operation successful", body.Message);
        Assert.True(body.IsSuccess);
        Assert.Null(body.Errors);
    }

    [Theory]
    [InlineData("NotFound", StatusCodes.Status404NotFound)]
    [InlineData("Conflict", StatusCodes.Status409Conflict)]
    [InlineData("ValidationError", StatusCodes.Status400BadRequest)]
    [InlineData(null, StatusCodes.Status500InternalServerError)]
    public void ToApiResponse_Failure_MapsMetadataToStatus(string? metadataKey, int expectedStatus)
    {
        var error = new Error("characterized error");
        if (metadataKey != null)
            error.WithMetadata(metadataKey, true);

        var action = new TestController().ToApiResponse(Result.Fail<string>(error));

        var response = Assert.IsType<ObjectResult>(action.Result);
        var body = Assert.IsType<ApiResponse<string>>(response.Value);
        Assert.Equal(expectedStatus, response.StatusCode);
        Assert.Equal(expectedStatus, body.Status);
        Assert.Equal("characterized error", body.Message);
        Assert.False(body.IsSuccess);
        Assert.NotNull(body.Errors);
    }
}
