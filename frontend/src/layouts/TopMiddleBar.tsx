import {
  Box,
  Divider,
  Flex,
  Paper,
  rem,
  Text,
} from "@mantine/core";
import {
  IconCode,
  IconDownload,
  IconShare,
} from "@tabler/icons-react";
import { useProjectStore } from "../store/useProjectStore";
import useProjectIcon from "../hooks/useProjectIcon";
import ConditionalHoverCard from "../components/ui/ConditionalHoverCard";
import useIsTruncated from "../hooks/useIsTruncated";
import { modals } from "@mantine/modals";
import useCodeGenRepo from "../data/repo/useCodeGenRepo";
import { useEditorStore } from "../store/useEditorStore";
import CustomNotification from "../components/ui/CustomNotification";
import TooltipIconButton from "../components/ui/TooltipIconButton";

function TopMiddleBar() {
  const { selectedProject } = useProjectStore();
  const dataSnap = useEditorStore((state) => state.getDataSnapshot);
  const { hasInvalidFields } = useCodeGenRepo(dataSnap());
  const isButtonDisabled = !selectedProject;
  const { isTruncated, textRef } = useIsTruncated<HTMLParagraphElement>(
    selectedProject?.name!
  );

  const { projectIcon, isProjectSelected } = useProjectIcon(
    selectedProject?.icon,
    selectedProject,
    selectedProject?.id
  );

  const onClickShare = async () => {
    try {
      const response = await fetch("http://localhost:3000/projects");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDynamicAction = (modal: string) => {
    if (hasInvalidFields(dataSnap().nodes)) {
      return CustomNotification({
        status: "error",
        message: "Some fields are missing names",
      });
    }

    modals.openContextModal({
      modal: modal,
      innerProps: {},
    });
  };

  return (
    <Box
      className="p-3.5 absolute z-10 top-0 left-1/2 transform -translate-x-1/2"
      maw={rem(340)}
      miw={rem(310)}
    >
      <Paper>
        <Flex
          className="p-2.5 h-full rounded-lg w-fit"
          gap="md"
          justify="flex-start"
          align={"center"}
          direction="row"
          wrap="nowrap"
        >
          <Flex gap="xs" direction="row" maw={rem(130)} miw={rem(130)}>
            <Text>{projectIcon}</Text>
            <ConditionalHoverCard
              dropdownText={selectedProject?.name!}
              showDropdown={isTruncated}
              openDelay={500}
              position="bottom"
              offset={15}
            >
              <Text ref={textRef} size="md" fw={500} className="truncate">
                {selectedProject?.name}
              </Text>
            </ConditionalHoverCard>
          </Flex>

          <Divider orientation="vertical" />
          <Flex className="gap-1" direction="row" wrap="wrap">
            {/* <TooltipIconButton
              icon={<IconTool className="p-0.5" />}
              label="Initial Setup"
              disabled={isButtonDisabled}
            /> */}
            <TooltipIconButton
              icon={<IconCode className="p-0.5" />}
              label="Code Generation"
              disabled={isButtonDisabled}
              onClick={() => handleDynamicAction("codeGen")}
            />
            <TooltipIconButton
              icon={<IconDownload className="p-0.5" />}
              label="Download Project"
              disabled={isButtonDisabled}
              onClick={() => handleDynamicAction("download")}
            />
            <TooltipIconButton
              icon={<IconShare className="p-0.5" />}
              label="Share Project"
              disabled={isButtonDisabled}
              onClick={() =>
                modals.openContextModal({
                  modal: "shareModal",
                  innerProps: {},
                })
              }
            />
          </Flex>
        </Flex>
      </Paper>
    </Box>
  );
}

export default TopMiddleBar;
