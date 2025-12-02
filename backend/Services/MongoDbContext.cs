using MongoDB.Driver;
using backend.Config;
using backend.Models;
using backend.Common.Attributes;
using Microsoft.Extensions.Options;

namespace backend.Services;

[SingletonService]
public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IOptions<MongoDbSettings> settings)
    {
        var client = new MongoClient(settings.Value.ConnectionString);
        _database = client.GetDatabase(settings.Value.DatabaseName);
    }

    public IMongoCollection<User> Users => _database.GetCollection<User>("users");
    public IMongoCollection<Project> Projects => _database.GetCollection<Project>("projects");
    public IMongoCollection<Settings> Settings => _database.GetCollection<Settings>("settings");
    public IMongoCollection<Changelog> Changelogs => _database.GetCollection<Changelog>("changelogs");
    public IMongoCollection<Models.Version> Versions => _database.GetCollection<Models.Version>("versions");
    public IMongoCollection<History> Histories => _database.GetCollection<History>("histories");
}
