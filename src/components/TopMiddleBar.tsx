import {
  ActionIcon,
  Box,
  Divider,
  Flex,
  HoverCard,
  Paper,
  rem,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconCode,
  IconDownload,
  IconSchool,
  IconShare,
  IconTool,
} from "@tabler/icons-react";
import { useProjectStore } from "../store/useProjectStore";
import useProjectIcon from "../utils/useProjectIcon";
import ConditionalHoverCard from "./ConditionalHoverCard";
import useIsTruncated from "../utils/useIsTruncated";
import { ReactNode } from "react";

function TopMiddleBar() {
  const { selectedProject } = useProjectStore();
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

  return (
    <Box
      className="p-3.5 absolute z-10 top-0 left-1/2 transform -translate-x-1/2"
      maw={rem(340)}
      miw={rem(337)}
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
            <TooltipIconButton 
              icon={<IconTool className="p-0.5" />}
              label="Initial Setup"
              disabled={isButtonDisabled}
            />
            <TooltipIconButton 
              icon={<IconCode className="p-0.5" />}
              label="Code Generation"
              disabled={isButtonDisabled}
            />
            <TooltipIconButton 
              icon={<IconDownload className="p-0.5" />}
              label="Download Project"
              disabled={isButtonDisabled}
            />
            <TooltipIconButton 
              icon={<IconShare className="p-0.5" />}
              label="Share Project"
              disabled={isButtonDisabled}
            />
          </Flex>
        </Flex>
      </Paper>
    </Box>
  );
}


function TooltipIconButton({
  icon,
  label,
  disabled
} : {
  icon: ReactNode
  label: string
  disabled: boolean
}) {

  return(
    <Tooltip label={label}>
      <ActionIcon
        variant="subtle"
        size="md"
        radius="sm"
        disabled={disabled}
      >
        {icon}
      </ActionIcon>
    </Tooltip> 
  )
}

export default TopMiddleBar;
