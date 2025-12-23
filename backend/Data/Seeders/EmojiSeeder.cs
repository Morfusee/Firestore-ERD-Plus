using backend.Common.Attributes;
using backend.DTOs.Emoji;
using backend.Mappers;
using backend.Models;
using backend.Services;
using MongoDB.Driver;

namespace backend.Data.Seeders;

[ScopedService]
public class EmojiSeeder(
    MongoDbContext context,
    EmojiMapper mapper,
    ILogger<EmojiSeeder> logger,
    HttpClient httpClient
)
{
    private readonly MongoDbContext _context = context;
    private readonly EmojiMapper _mapper = mapper;
    private readonly ILogger<EmojiSeeder> _logger = logger;
    private readonly HttpClient _httpClient = httpClient;

    public async Task SeedAsync()
    {
        try
        {
            // Check if emojis already exist
            var count = await _context.Emojis.CountDocumentsAsync(FilterDefinition<Emoji>.Empty);

            if (count > 0)
            {
                _logger.LogInformation("Emojis already seeded. Skipping seeding.");
                return;
            }

            // Read the emojis from https://www.emoji.family/api/emojis
            var emojis = await FetchEmojisFromApiAsync();

            if (emojis.Count == 0)
            {
                _logger.LogWarning("No emojis fetched from the API");
                return;
            }

            // Insert emojis into the database
            await _context.Emojis.InsertManyAsync(emojis.Select(e => _mapper.ToModel(e)));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding emojis");
            return;
        }
    }

    public async Task<List<EmojiResponseDto>> FetchEmojisFromApiAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync("https://www.emoji.family/api/emojis");

            response.EnsureSuccessStatusCode();

            var emojis = await response.Content.ReadFromJsonAsync<List<EmojiResponseDto>>();

            return emojis ?? [];
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching emojis from API");
            return [];
        }
    }
}
