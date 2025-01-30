import { ThemeIcon, useMantineTheme } from "@mantine/core";
import { IconCheck, IconExclamationMark } from "@tabler/icons-react";

export const StatusIcon = ({ status }: { status: "success" | "error" }) => {
  const theme = useMantineTheme();
  if (status === "error") {
    return (
      <ThemeIcon variant="filled" radius={"xl"} bg={theme.colors.orange[6]}>
        <IconExclamationMark size={"1.5rem"} color={theme.colors.dark[9]} />
      </ThemeIcon>
    );
  }

  return (
    <ThemeIcon variant="filled" radius={"xl"} bg={theme.colors.teal[8]}>
      <IconCheck size={"1.25rem"} />
    </ThemeIcon>
  );
};
