import { Box, Flex, Paper } from "@mantine/core";
import {
  IconNote,
  IconPointerFilled,
  IconTableFilled,
} from "@tabler/icons-react";
import useIsDarkMode from "../hooks/useIsDarkMode";
import useProjectRepo from "../data/repo/useProjectRepo";
import TooltipIconButton from "../components/ui/TooltipIconButton";
import { useToolbarStore } from "../store/useToolbarStore";
import useToolbarRepo from "../data/repo/useToolbarRepo";

function BottomMiddleBar() {
  const isDarkMode = useIsDarkMode();

  const { selectedProject, validateRole } = useProjectRepo();
  const isButtonDisabled = !selectedProject;

  const currentTool = useToolbarStore(state => state.currentTool)
  const { changeTool } = useToolbarRepo()

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
            <TooltipIconButton
              label="Select"
              icon={<IconPointerFilled className="p-0.5" />}
              variant="subtle" size="md" radius="sm"
              active={currentTool == "select"}
              onClick={() => changeTool("select")}
            />
            <TooltipIconButton
              label="Table"
              icon={<IconTableFilled className="p-0.5" />}
              variant="subtle"
              size="md"
              radius="sm"
              disabled={isButtonDisabled || !validateRole()}
              active={currentTool == "table"}
              onClick={() => changeTool("table")}
            />
            <TooltipIconButton
              label="Note"
              icon={
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
              }
              variant="subtle"
              size="md"
              radius="sm"
              disabled={isButtonDisabled || !validateRole()}
              active={currentTool == "note"}
              onClick={() => changeTool("note")}
            />
          </Flex>
        </Flex>
      </Paper>
    </Box>
  );
}

export default BottomMiddleBar;
