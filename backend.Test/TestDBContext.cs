using backend.Config;
using backend.DTOs.Emoji;
using backend.Mappers;
using backend.Models;
using backend.Services;
using Microsoft.Extensions.Options;
using Mongo2Go;

namespace backend.Test;

public class TestDBContext : IDisposable
{
    protected readonly EmojiMapper _emojiMapper;
    protected readonly MongoDbRunner _mongoRunner;
    protected readonly MongoDbContext _mongoDbContext;
    protected readonly string _databaseName = "FirestoreERDPlusTest";
    protected readonly string _connectionString;
    protected User MockUser { get; private set; } =
        new User
        {
            Email = "test@example.com",
            Username = "testuser",
            DisplayName = "Test User",
        };

    public TestDBContext()
    {
        _mongoRunner = MongoDbRunner.Start();
        _connectionString = _mongoRunner.ConnectionString;

        // Setup MongoDB context with in-memory connection
        var settings = Options.Create(
            new MongoDbSettings
            {
                ConnectionString = _connectionString,
                DatabaseName = _databaseName,
            }
        );

        _mongoDbContext = new MongoDbContext(settings);

        // Emoji mapper for seeding emojis
        _emojiMapper = new EmojiMapper();

        // Seed initial data
        SeedData().GetAwaiter().GetResult();
    }

    public async Task SeedData()
    {
        await SeedEmojis();
        await SeedUser();
        await SeedProjects();
        await SeedSettings();
    }

    public async Task SeedEmojis()
    {
        var emojis = new EmojiResponseDto[]
        {
            new()
            {
                Emoji = "😀",
                Hexcode = "1F600",
                Group = "smileys-emotion",
                Subgroup = "face-smiling",
                Annotation = "grinning face",
                Tags = ["happy", "smile"],
                Shortcodes = [":grinning:"],
                Emoticons = [":D"],
                Directional = false,
                Variation = false,
                Unicode = 128512,
                Order = 1,
            },
            new()
            {
                Emoji = "😁",
                Hexcode = "1F601",
                Group = "smileys-emotion",
                Subgroup = "face-smiling",
                Annotation = "beaming face with smiling eyes",
                Tags = ["happy", "smile", "eyes"],
                Shortcodes = [":grin:"],
                Emoticons = [":D"],
                Directional = false,
                Variation = false,
                Unicode = 128513,
                Order = 2,
            },
            new()
            {
                Emoji = "🚀",
                Hexcode = "1F680",
                Group = "travel-places",
                Subgroup = "transport-air",
                Annotation = "rocket",
                Tags = ["launch", "space"],
                Shortcodes = [":rocket:"],
                Emoticons = [],
                Directional = false,
                Variation = false,
                Unicode = 128640,
                Order = 3,
            },
        };

        await _mongoDbContext.Emojis.InsertManyAsync(emojis.Select(e => _emojiMapper.ToModel(e)));
    }

    public async Task SeedUser()
    {
        await _mongoDbContext.Users.InsertOneAsync(MockUser);
    }

    public async Task SeedProjects()
    {
        var projects = new Project[]
        {
            new()
            {
                Name = "Project Alpha",
                Icon = "1F600",
                Members = [new Member { UserId = MockUser.Id, Role = MemberRole.Owner }],
            },
            new()
            {
                Name = "Project Beta",
                Icon = "1F601",
                Members = [new Member { UserId = MockUser.Id, Role = MemberRole.Owner }],
            },
        };

        await _mongoDbContext.Projects.InsertManyAsync(projects);
    }

    public async Task SeedSettings()
    {
        var settings = new Settings
        {
            UserId = MockUser.Id,
            Theme = ThemeOptions.Dark,
            CanvasBackground = CanvasBackgroundOptions.Dots,
            AutoSaveInterval = 0,
        };

        await _mongoDbContext.Settings.InsertOneAsync(settings);
    }

    public void Dispose()
    {
        // Clean up: Stop MongoDB runner
        _mongoRunner?.Dispose();
        GC.SuppressFinalize(this);
    }
}
