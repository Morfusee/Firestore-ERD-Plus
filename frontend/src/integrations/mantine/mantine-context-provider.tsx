import useUserSettings from "@/hooks/useUserSettings";
import {
  MantineColorScheme,
  MantineProvider,
  useMantineColorScheme,
} from "@mantine/core";
import { createContext, useContext, useEffect, useState } from "react";
import createMantineTheme from "./mantine-theme";

interface ReactiveThemeContextValue {
  currentTheme: ReturnType<typeof createMantineTheme>;
  updateTheme: React.Dispatch<
    React.SetStateAction<ReturnType<typeof createMantineTheme>>
  >;
}

const ReactiveThemeContext = createContext<
  ReactiveThemeContextValue | undefined
>(undefined);

export function useReactiveTheme() {
  const ctx = useContext(ReactiveThemeContext);
  if (!ctx)
    throw new Error(
      "useReactiveTheme must be used within a ReactiveThemeProvider"
    );
  return ctx;
}

export function ReactiveThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentTheme, updateTheme] = useState(createMantineTheme(false));
  const { settings } = useUserSettings()

  return (
    <ReactiveThemeContext.Provider value={{ currentTheme, updateTheme }}>
      <MantineProvider
        theme={currentTheme}
        defaultColorScheme={settings.theme.toLowerCase() as MantineColorScheme}
      >
        <ThemeSyncWrapper>{children}</ThemeSyncWrapper>
      </MantineProvider>
    </ReactiveThemeContext.Provider>
  );
}

function ThemeSyncWrapper({ children }: { children: React.ReactNode }) {
  const { updateTheme } = useReactiveTheme();
  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    updateTheme(createMantineTheme(colorScheme === "dark"));
  }, [colorScheme, updateTheme]);

  return <>{children}</>;
}
