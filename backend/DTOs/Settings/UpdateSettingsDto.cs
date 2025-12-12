using backend.DTOs.Common;
using backend.Models;

namespace backend.DTOs.Settings;

public class UpdateSettingsDto : EmailDto
{
    public int? AutoSaveInterval { get; set; }

    public CanvasBackgroundOptions? CanvasBackground { get; set; }

    public ThemeOptions? Theme { get; set; }
}
