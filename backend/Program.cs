using System.Reflection;
using System.Text.Json.Serialization;
using backend.Common.Extensions;
using backend.Common.Handlers;
using backend.Config;
using backend.Data.Seeders;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file
Env.Load();
builder.Configuration.AddEnvironmentVariables();

// Services
builder.Services.AddAppCors(builder.Configuration);
builder.Services.AddAppOptions(builder.Configuration);
builder.Services.AddAppAuthentication(builder.Configuration);
builder.Services.AddAppSwagger(builder.Configuration);

// Add the HttpClientFactory service to the container.
builder.Services.AddHttpClient();

// Exception Handling
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// Add controllers with JSON options for enum serialization
builder
    .Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Register all services with attributes dynamically
var assembly = Assembly.GetExecutingAssembly();
builder.Services.RegisterServicesWithAttributes(assembly);

// HSTS baseline previously supplied by Helmet; middleware is wired below
// only outside development, and only adds the header for HTTPS requests.
builder.Services.AddHsts(
    options =>
    {
        options.MaxAge = TimeSpan.FromDays(365);
        options.IncludeSubDomains = true;
        options.Preload = true;
    }
);

var app = builder.Build();

// Seed emojis on startup
using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<EmojiSeeder>();
    await seeder.SeedAsync();
}

app.UseCors("AllowFrontend");

// Baseline security headers previously supplied by Helmet in the old backend:
// frame denial, MIME no-sniff, and cross-domain policy restriction.
app.Use(
    async (context, next) =>
    {
        context.Response.Headers["X-Frame-Options"] = "DENY";
        context.Response.Headers["X-Content-Type-Options"] = "nosniff";
        context.Response.Headers["X-Permitted-Cross-Domain-Policies"] = "none";
        await next();
    }
);

// Source - https://stackoverflow.com/a
// Posted by Andrei, modified by community. See post 'Timeline' for change history
// Retrieved 2025-12-01, License - CC BY-SA 4.0
app.UseExceptionHandler(_ => { });

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Firestore ERD Plus API v1");
        options.RoutePrefix = "swagger";
    });
    app.MapOpenApi();
}

app.UseHttpsRedirection();
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

// Allows WebApplicationFactory<Program> to reference this entry point.
public partial class Program;
