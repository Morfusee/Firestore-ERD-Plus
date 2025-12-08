import useGlobalHotkeys from "./hooks/useGlobalHotkeys";
import useTheme from "./hooks/useTheme";
import { useThemeStore } from "./store/globalStore";

function App() {
  const { theme } = useThemeStore();
}

function AppRouting() {
  const { theme } = useThemeStore();

  // Invoke the useTheme hook to update the theme
  const themeData = useTheme();

  // Invoke the global hotkeys
  useGlobalHotkeys();

  // Show nothing if the theme is empty
  if (Object.keys(theme).length === 0) {
    return null;
  }
}

export default App;
