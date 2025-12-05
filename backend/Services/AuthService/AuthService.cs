using System.CodeDom;
using backend.Config;
using backend.DTOs.Auth;
using backend.Mappers;
using backend.Services.UserService;
using FirebaseAdmin;
using FirebaseAdmin.Auth;
using FluentResults;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Options;

namespace backend.Services.AuthService;

public class AuthService(
    MongoDbContext context,
    UserMapper userMapper,
    IUserService userService,
    IOptions<FirebaseSettings> firebaseSettings,
    ILogger<AuthService> logger
) : IAuthService
{
    private readonly MongoDbContext _context = context;
    private readonly UserMapper _userMapper = userMapper;
    private readonly IUserService _userService = userService;
    private readonly ILogger<AuthService> _logger = logger;

    private readonly FirebaseAuth _firebaseAuth = InitializeFirebaseAuth(firebaseSettings);

    private static FirebaseAuth InitializeFirebaseAuth(IOptions<FirebaseSettings> firebaseSettings)
    {
        if (FirebaseApp.DefaultInstance == null)
        {
            var serviceAccountJson = firebaseSettings.Value.ServiceAccountJson;
            FirebaseApp.Create(
                new AppOptions { Credential = GoogleCredential.FromJson(serviceAccountJson) }
            );
        }

        return FirebaseAuth.DefaultInstance;
    }

    public Task<Result<AuthResponseDto>> LoginAsync(LoginDto loginDto)
    {
        throw new NotImplementedException();
    }

    public Task<Result<AuthResponseDto>> RegisterAsync(RegisterDto registerDto)
    {
        throw new NotImplementedException();
    }

    public Task<Result<string>> VerifyTokenAsync(string token)
    {
        throw new NotImplementedException();
    }
}
