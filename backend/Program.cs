using System.Reflection;
using backend.Common.Extensions;
using backend.Common.Handlers;
using backend.Config;
using DotNetEnv;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file
Env.Load();
builder.Configuration.AddEnvironmentVariables();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// Configure MongoDbSettings
builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDbSettings"));

// Add controllers
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Register all services with attributes dynamically
var assembly = Assembly.GetExecutingAssembly();
builder.Services.RegisterServicesWithAttributes(assembly);

var app = builder.Build();

// Source - https://stackoverflow.com/a
// Posted by Andrei, modified by community. See post 'Timeline' for change history
// Retrieved 2025-12-01, License - CC BY-SA 4.0
app.UseExceptionHandler(_ => { });

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
