import { useMantineColorScheme } from "@mantine/core";

function useIsDarkMode() {
  const { colorScheme } = useMantineColorScheme();
  return colorScheme === "dark";
}

export default useIsDarkMode;
