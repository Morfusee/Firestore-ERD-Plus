import { useEffect, useState } from "react";
import useIsDarkMode from "./useIsDarkMode";
import {
  ActionIcon,
  Button,
  createTheme,
  Loader,
  MantineTheme,
  Paper,
  SegmentedControl,
  TabsList,
  TabsTab,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import "../css/variants.css";
import { Notifications } from "@mantine/notifications";

function useTheme() {
  const isDarkMode = useIsDarkMode();
  const mantineTheme = useMantineTheme();
  const [theme, setTheme] = useState(themeCurator(isDarkMode, mantineTheme));

  useEffect(() => {
    setTheme(themeCurator(isDarkMode, mantineTheme));
  }, [isDarkMode]);

  return theme;
}

function themeCurator(isDarkMode: boolean, mantineTheme: MantineTheme) {
  return createTheme({
    components: {
      ActionIcon: ActionIcon.extend({
        defaultProps: {
          // Set color based on theme
          color: isDarkMode ? mantineTheme.colors.gray[4] : "none",
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
          color: isDarkMode ? mantineTheme.colors.dark[4] : "none",
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
          bd:
            "1px solid " +
            (isDarkMode
              ? mantineTheme.colors.dark[4]
              : mantineTheme.colors.gray[4]),
        },
      }),
      Button: Button.extend({
        defaultProps: {
          // Set hover and text color based on theme and variant
          color: isDarkMode
            ? mantineTheme.colors.dark[0]
            : mantineTheme.colors.gray[9],
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
          color: isDarkMode
            ? mantineTheme.colors.dark[8]
            : mantineTheme.colors.dark[6],
          bg: isDarkMode
            ? mantineTheme.colors.dark[5]
            : mantineTheme.colors.dark[1],
        },
      }),
      TabsTab: TabsTab.extend({
        defaultProps: {
          // Set color based on theme
          color: isDarkMode
            ? mantineTheme.colors.dark[4]
            : mantineTheme.colors.dark[8],
        },
      }),
      Loader: Loader.extend({
        defaultProps: {
          color: isDarkMode
            ? mantineTheme.colors.dark[2]
            : mantineTheme.colors.gray[9],
        },
      }),
    },
  });
}

export default useTheme;
