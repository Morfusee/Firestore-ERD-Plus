import { ActionIcon, Box, Flex, Paper } from "@mantine/core";
import {
  IconNote,
  IconPointerFilled,
  IconTableFilled,
} from "@tabler/icons-react";
import useIsDarkMode from "../utils/useIsDarkMode";
import useEditorRepo from "../data/repo/useEditorRepo";
import useProjectRepo from "../data/repo/useProjectRepo";

function BottomMiddleBar() {
  const isDarkMode = useIsDarkMode();
  const { selectedProject } = useProjectRepo();

  const isButtonDisabled = !selectedProject;

  const { addNode } = useEditorRepo();

  return (
    <Box className="p-3.5 absolute z-10 bottom-0 left-1/2 transform -translate-x-1/2">
      <Paper className="p-2.5 h-full rounded-lg w-fit">
        <Flex
          gap="md"
          justify="flex-start"
          align={"center"}
          direction="row"
          wrap="wrap"
        >
          <Flex className="gap-1" direction="row" wrap="wrap">
            <ActionIcon variant="subtle" size="md" radius="sm">
              <IconPointerFilled className="p-0.5" />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="md"
              radius="sm"
              onClick={() => addNode("table")}
              disabled={isButtonDisabled}
            >
              <IconTableFilled className="p-0.5" />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="md"
              radius="sm"
              onClick={() => addNode("note")}
              disabled={isButtonDisabled}
            >
              <IconNote
                className="p-0.5"
                fill={
                  isButtonDisabled
                    ? isDarkMode
                      ? "#696969"
                      : "#ADB5BD"
                    : isDarkMode
                    ? "#CED4DA"
                    : "#2e2e2e"
                }
                stroke={1.5}
              />
            </ActionIcon>
          </Flex>
        </Flex>
      </Paper>
    </Box>
  );
}

export default BottomMiddleBar;
