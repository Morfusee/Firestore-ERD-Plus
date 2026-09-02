using backend.Common.Attributes;
using backend.Common.Extensions;
using backend.DTOs.Common;
using backend.DTOs.Project;
using backend.Mappers;
using backend.Models;
using backend.Services.EmojiService;
using FluentResults;
using MongoDB.Driver;

namespace backend.Services.ProjectService;

[ScopedService]
public class ProjectService(
    MongoDbContext context,
    ProjectMapper mapper,
    IEmojiService emojiService
) : IProjectService
{
    private readonly MongoDbContext _context = context;
    private readonly ProjectMapper _mapper = mapper;
    private readonly IEmojiService _emojiService = emojiService;

    public async Task<Result<PaginatedResponseDto<ProjectResponseDto>>> GetAllProjectsAsync(
        PaginationDto pagination,
        FilterDefinition<Project>? accessFilter = null
    )
    {
        try
        {
            var filter = accessFilter ?? Builders<Project>.Filter.Empty;
            var projects = await _context
                .Projects.Find(filter)
                .ToPaginatedListAsync(pagination, ToResponseAsync);

            return Result.Ok(projects);
        }
        catch (Exception ex)
        {
            return Result
                .Fail<PaginatedResponseDto<ProjectResponseDto>>("Failed to retrieve projects")
                .WithError(ex.Message);
        }
    }

    public async Task<Result<ProjectResponseDto>> CreateProjectAsync(
        CreateProjectDto createProjectDto
    )
    {
        try
        {
            var emoji = await _emojiService.GetEmojiByHexcodeAsync(createProjectDto.Icon);

            if (!emoji.IsSuccess || emoji.Value == null)
            {
                return Result.Fail<ProjectResponseDto>("Invalid emoji icon");
            }

            var user = await _context
                .Users.Find(u =>
                    u.Email.Equals(
                        createProjectDto.Email,
                        StringComparison.CurrentCultureIgnoreCase
                    )
                )
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return ResultExtensions.NotFound<ProjectResponseDto>("User not found");
            }

            var project = _mapper.ToProject(createProjectDto, user.Id);

            await _context.Projects.InsertOneAsync(project);

            return Result.Ok(await ToResponseAsync(project));
        }
        catch (Exception ex)
        {
            return Result
                .Fail<ProjectResponseDto>("Failed to create project")
                .WithError(ex.Message);
        }
    }

    public async Task<Result<bool>> DeleteProjectAsync(string id)
    {
        try
        {
            var deleteProject = await _context.Projects.DeleteOneAsync(proj => proj.Id == id);

            if (deleteProject.DeletedCount == 0)
            {
                return ResultExtensions.NotFound<bool>("Project not found");
            }

            return Result.Ok(true);
        }
        catch (Exception ex)
        {
            return Result.Fail<bool>("Failed to delete project").WithError(ex.Message);
        }
    }

    public async Task<Result<ProjectResponseDto>> GetProjectByIdAsync(string id)
    {
        try
        {
            var project = await _context.Projects.Find(proj => proj.Id == id).FirstOrDefaultAsync();

            if (project == null)
            {
                return ResultExtensions.NotFound<ProjectResponseDto>("Project not found");
            }

            return Result.Ok(await ToResponseAsync(project));
        }
        catch (Exception ex)
        {
            return Result
                .Fail<ProjectResponseDto>("Failed to retrieve project")
                .WithError(ex.Message);
        }
    }

    public async Task<Result<PaginatedResponseDto<ProjectResponseDto>>> GetProjectsByEmailAsync(
        EmailDto emailDto,
        PaginationDto pagination
    )
    {
        try
        {
            var user = await _context
                .Users.Find(u =>
                    u.Email.Equals(emailDto.Email, StringComparison.CurrentCultureIgnoreCase)
                )
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return ResultExtensions.NotFound<PaginatedResponseDto<ProjectResponseDto>>(
                    "User not found"
                );
            }

            var projects = await _context
                .Projects.Find(proj => proj.Members.Any(m => m.UserId == user.Id))
                .ToPaginatedListAsync(pagination, ToResponseAsync);

            return Result.Ok(projects);
        }
        catch (Exception ex)
        {
            return Result
                .Fail<PaginatedResponseDto<ProjectResponseDto>>("Failed to retrieve project")
                .WithError(ex.Message);
        }
    }

    public async Task<Result<ProjectResponseDto>> SaveProjectAsync(SaveProjectDto saveProjectDto)
    {
        try
        {
            var saveProject = await _context.Projects.FindOneAndUpdateAsync(
                proj => proj.Id == saveProjectDto.Id,
                Builders<Project>
                    .Update.Set(p => p.Data, saveProjectDto.Data)
                    .Set(p => p.UpdatedAt, DateTime.UtcNow),
                new FindOneAndUpdateOptions<Project> { ReturnDocument = ReturnDocument.After }
            );

            if (saveProject == null)
            {
                return ResultExtensions.NotFound<ProjectResponseDto>("Project not found");
            }

            return Result.Ok(await ToResponseAsync(saveProject));
        }
        catch (Exception ex)
        {
            return Result.Fail<ProjectResponseDto>("Failed to save project").WithError(ex.Message);
        }
    }

    public async Task<Result<ProjectResponseDto>> UpdateProjectAsync(
        UpdateProjectDto updateProjectDto
    )
    {
        try
        {
            var updateDefinition = Builders<Project>.Update.Set(p => p.UpdatedAt, DateTime.UtcNow);

            if (!string.IsNullOrEmpty(updateProjectDto.Name))
            {
                updateDefinition = updateDefinition.Set(p => p.Name, updateProjectDto.Name);
            }

            if (!string.IsNullOrEmpty(updateProjectDto.Icon))
            {
                updateDefinition = updateDefinition.Set(p => p.Icon, updateProjectDto.Icon);
            }

            var updatedProject = await _context.Projects.FindOneAndUpdateAsync(
                proj => proj.Id == updateProjectDto.Id,
                updateDefinition,
                new FindOneAndUpdateOptions<Project> { ReturnDocument = ReturnDocument.After }
            );

            if (updatedProject == null)
            {
                return ResultExtensions.NotFound<ProjectResponseDto>("Project not found");
            }

            return Result.Ok(await ToResponseAsync(updatedProject));
        }
        catch (Exception ex)
        {
            return Result
                .Fail<ProjectResponseDto>("Failed to update project")
                .WithError(ex.Message);
        }
    }

    // =======================
    // Helpers
    // =======================
    private async Task<ProjectResponseDto> ToResponseAsync(Project project)
    {
        var emoji = await _emojiService.GetEmojiByHexcodeAsync(project.Icon);

        return emoji.IsSuccess && emoji.Value != null
            ? _mapper.ToDto(project, emoji.Value)
            : _mapper.ToDto(project);
    }
}
