using System.ComponentModel.DataAnnotations;
using backend.DTOs.Common;
using backend.Models;

namespace backend.DTOs.Settings;

public class UpdateSettingsDto : EmailDto
{
    [Range(0, 50, ErrorMessage = "AutoSaveInterval must be between 0 and 50.")]
    public int? AutoSaveInterval { get; set; }

    public CanvasBackgroundOptions? CanvasBackground { get; set; }

    public ThemeOptions? Theme { get; set; }
}
