import {
  ActionIcon,
  Button,
  createTheme,
  Loader,
  Paper,
  ScrollArea,
  SegmentedControl,
  TabsTab,
  ThemeIcon
} from "@mantine/core";

export function createMantineTheme(isDarkMode: boolean) {
  return createTheme({
    components: {
      ActionIcon: ActionIcon.extend({
        defaultProps: {
          // Set color based on theme
          color: isDarkMode ? "gray.4" : "none",
        },
        // Add custom variant
        classNames(theme, props, ctx) {
          if (props.variant === "shadow") {
            return {
              root: isDarkMode
                ? "shadow-action-icon-dark"
                : "shadow-action-icon-light",
            };
          }

          return {
            root: "actionIcon",
          };
        },
        // Set some attributes based on variant
        vars: (theme, props) => {
          if (props.variant === "filled") {
            return {
              root: {
                "--ai-bg": isDarkMode
                  ? theme.colors.dark[4]
                  : theme.colors.dark[5],
              },
            };
          }

          return { root: {} };
        },
      }),
      ThemeIcon: ThemeIcon.extend({
        defaultProps: {
          // Set color based on theme
          color: isDarkMode ? "dark.4" : "none",
        },
        // Set some attributes based on variant
        vars: (theme, props) => {
          if (props.variant === "filled") {
            return {
              root: {
                "--ti-bg": isDarkMode
                  ? theme.colors.dark[4]
                  : theme.colors.dark[5],
              },
            };
          }

          return {
            root: {},
          };
        },
      }),
      Paper: Paper.extend({
        defaultProps: {
          bd: "1px solid " + (isDarkMode ? "dark.4" : "gray.4"),
        },
      }),
      Button: Button.extend({
        defaultProps: {
          // Set hover and text color based on theme and variant
          color: isDarkMode ? "dark.0" : "gray.9",
        },
        vars: (theme, props) => {
          if (props.variant === "filled") {
            return {
              root: {
                "--button-bg": isDarkMode
                  ? theme.colors.dark[9]
                  : theme.colors.gray[9],
                "--button-hover": isDarkMode
                  ? theme.colors.dark[4]
                  : theme.colors.gray[7],
              },
            };
          }

          return { root: {} };
        },
      }),
      SegmentedControl: SegmentedControl.extend({
        defaultProps: {
          // Set color based on theme
          color: isDarkMode ? "dark.8" : "dark.6",
          bg: isDarkMode ? "dark.5" : "dark.1",
        },
      }),
      TabsTab: TabsTab.extend({
        defaultProps: {
          // Set color based on theme
          color: isDarkMode ? "dark.4" : "dark.8",
        },
      }),
      Loader: Loader.extend({
        defaultProps: {
          color: isDarkMode ? "dark.2" : "gray.9",
        },
      }),
      ScrollArea: ScrollArea.extend({
        styles: {
          thumb: {
            backgroundColor: isDarkMode ? "dark.2" : "dark.5",
          },
        },
      }),
    },
  });
}

export default createMantineTheme;
