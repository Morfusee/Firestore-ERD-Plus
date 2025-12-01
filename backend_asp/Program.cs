using System.Reflection;
using backend_asp.Common.Handlers;
using backend_asp.Config;
using backend_asp.Services;
using DotNetEnv;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file
Env.Load();
builder.Configuration.AddEnvironmentVariables();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// Configure MongoDbSettings
builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.AddSingleton<MongoDbContext>(); // Register MongoDbContext

// Add controllers
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Register all services
var serviceAssembly = Assembly.GetExecutingAssembly();
var serviceTypes = serviceAssembly.GetTypes()
    .Where(t => t.IsClass && !t.IsAbstract && t.Name.EndsWith("Service"));
foreach (var type in serviceTypes)
{
    builder.Services.AddScoped(type);
}

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
