using backend.DTOs.Common;
using backend.Models;

namespace backend.DTOs.Settings;

public class CreateSettingsDto : EmailDto
{
    public int AutoSaveInterval { get; set; } = 0;

    public CanvasBackgroundOptions CanvasBackground { get; set; } = CanvasBackgroundOptions.Dots;

    public ThemeOptions Theme { get; set; } = ThemeOptions.Dark;
}
