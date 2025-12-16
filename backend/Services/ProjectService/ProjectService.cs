using backend.Common.Attributes;
using backend.DTOs.Common;
using backend.DTOs.Project;
using backend.Mappers;
using FluentResults;
using MongoDB.Driver;

namespace backend.Services.ProjectService;

[ScopedService]
public class ProjectService(MongoDbContext context, ProjectMapper mapper) : IProjectService
{
    private readonly MongoDbContext _context = context;
    private readonly ProjectMapper _mapper = mapper;

    public async Task<Result<IEnumerable<ProjectResponseDto>>> GetAllProjectsAsync()
    {
        try
        {
            var project = await _context.Projects.Find(_ => true).ToListAsync();
            var projectDtos = project.ConvertAll(proj => _mapper.ToDto(proj));
            return Result.Ok<IEnumerable<ProjectResponseDto>>(projectDtos);
        }
        catch (Exception ex)
        {
            return Result
                .Fail<IEnumerable<ProjectResponseDto>>("Failed to retrieve projects")
                .WithError(ex.Message);
        }
    }

    public async Task<Result<ProjectResponseDto>> CreateProjectAsync(
        CreateProjectDto createProjectDto
    )
    {
        try
        {
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
                return Result.Fail<ProjectResponseDto>("User not found");
            }

            var project = _mapper.ToProject(createProjectDto, user.Id);

            await _context.Projects.InsertOneAsync(project);

            return Result.Ok(_mapper.ToDto(project));
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
            var deleteProject = _context.Projects.DeleteOneAsync(proj => proj.Id == id);

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
                return Result.Fail<ProjectResponseDto>("Project not found");
            }

            return Result.Ok(_mapper.ToDto(project));
        }
        catch (Exception ex)
        {
            return Result
                .Fail<ProjectResponseDto>("Failed to retrieve project")
                .WithError(ex.Message);
        }
    }

    public Task<Result<ProjectResponseDto>> GetProjectsByEmailAsync(EmailDto emailDto)
    {
        throw new NotImplementedException();
    }

    public Task<Result<ProjectResponseDto>> SaveProjectAsync(SaveProjectDto saveProjectDto)
    {
        throw new NotImplementedException();
    }

    public Task<Result<ProjectResponseDto>> UpdateProjectAsync(UpdateProjectDto updateProjectDto)
    {
        throw new NotImplementedException();
    }
}
