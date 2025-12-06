using backend.Common.Handlers;
using backend.Config;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi;

namespace backend.Common.Extensions;

public static class ServiceCollectionExtensions
{
    private const string CorsPolicyName = "AllowFrontend";

    public static IServiceCollection AddAppCors(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        var origin = configuration.GetValue<string>("Frontend:Origin") ?? "http://localhost:5173";

        services.AddCors(options =>
        {
            options.AddPolicy(
                CorsPolicyName,
                policy =>
                    policy.WithOrigins(origin).AllowAnyHeader().AllowAnyMethod().AllowCredentials()
            );
        });

        return services;
    }

    public static IServiceCollection AddAppAuthentication(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddScheme<JwtBearerOptions, FirebaseAuthenticationHandler>(
                JwtBearerDefaults.AuthenticationScheme,
                _ => { }
            );
        services.AddAuthorization();

        return services;
    }

    public static IServiceCollection AddAppSwagger(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc(
                "v1",
                new OpenApiInfo
                {
                    Title = "Firestore ERD Plus API",
                    Version = "v1",
                    Description = "API for Firestore ERD Plus application",
                }
            );

            var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);

            if (File.Exists(xmlPath))
            {
                options.IncludeXmlComments(xmlPath);
            }
        });

        services.AddOpenApi();

        return services;
    }

    public static IServiceCollection AddAppOptions(
        this IServiceCollection services,
        IConfiguration config
    )
    {
        services.Configure<MongoDbSettings>(config.GetSection(nameof(MongoDbSettings)));
        services.Configure<FirebaseSettings>(config.GetSection(nameof(FirebaseSettings)));

        return services;
    }
}
