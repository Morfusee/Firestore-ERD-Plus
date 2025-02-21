import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Flex,
  Group,
  Loader,
  Paper,
  Popover,
  Stack,
  Text,
  Timeline,
  Title,
  Transition,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure, useViewportSize } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import {
  IconEdit,
  IconHistory,
  IconHistoryToggle,
  IconLogout,
} from "@tabler/icons-react";
import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import useUserRepo from "../data/repo/useUserRepo";
import useChangelogRepo from "../data/repo/useChangelogRepo";
import { IChangelog, IMember } from "../store/useChangelogStore";
import useProjectRepo from "../data/repo/useProjectRepo";
import useEditorRepo from "../data/repo/useEditorRepo";
import { IProject } from "../types/ProjectTypes";
import { IEditorDataSnapshot } from "../types/EditorStoreTypes";
import { useNavigate } from "react-router-dom";

function TopRightBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const openedDrawer = drawerOpen;

  return (
    <Flex
      className="p-5 absolute z-10 top-0 right-0"
      gap={"md"}
      direction={"column"}
    >
      <ActionButtons toggleDrawer={toggleDrawer} openedDrawer={openedDrawer} />
      <Drawer opened={openedDrawer} />
    </Flex>
  );
}

function ActionButtons({
  toggleDrawer,
  openedDrawer,
}: {
  toggleDrawer: () => void;
  openedDrawer: boolean;
}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigate = useNavigate();

  const { logoutUser } = useUserRepo();
  const { selectedProject } = useProjectStore();
  const isButtonDisabled = !selectedProject;

  const { width } = useViewportSize();

  const [opened, handlers] = useDisclosure(false);

  const { user } = useUserRepo();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    logoutUser()
      .then((status) => {
        if (status) navigate("/login");
        setIsLoggingOut(false);
      })
      .catch(() => {
        setIsLoggingOut(false);
      });
  };

  return (
    <Flex
      gap="sm"
      justify="flex-end"
      direction={width < 900 ? "column" : "row"}
      wrap="wrap"
    >
      <ActionIcon
        variant="subtle"
        size="lg"
        radius="xl"
        onClick={toggleDrawer}
        disabled={isButtonDisabled}
      >
        {openedDrawer ? <IconHistoryToggle /> : <IconHistory />}
      </ActionIcon>
      <Popover
        position="bottom-end"
        width={300}
        transitionProps={{
          transition: "pop-top-right",
        }}
        opened={opened}
        onChange={() => handlers.close()}
        clickOutsideEvents={["click", "mousedown", "pointerdown"]}
      >
        <Popover.Target>
          <Avatar
            component="button"
            size={34}
            onClick={() => handlers.toggle()}
          />
        </Popover.Target>

        <Popover.Dropdown>
          <Stack align="center" gap="sm">
            <Avatar size={72} />

            <Stack gap={2} justify="center">
              <Title order={2} ta="center">
                {user?.displayName}
              </Title>
              <Text ta="center">{user?.email}</Text>
            </Stack>

            <Group w="100%" gap="xs">
              <Button
                className="flex-1"
                variant="light"
                leftSection={<IconEdit />}
                onClick={() => {
                  handlers.close();
                  modals.openContextModal({
                    modal: "manageAcc",
                    innerProps: {},
                  });
                }}
              >
                Manage
              </Button>
              <Button
                className="flex-1"
                variant="default"
                leftSection={<IconLogout />}
                onClick={handleLogout}
              >
                {isLoggingOut ? <Loader size={"sm"} /> : "Log out"}
              </Button>
            </Group>
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </Flex>
  );
}

function Drawer({ opened }: { opened: boolean }) {
  return (
    <Transition
      mounted={opened}
      transition="slide-left"
      duration={250}
      timingFunction="ease"
    >
      {(styles) => (
        <Paper
          radius="md"
          p="xs"
          miw={"14.5rem"}
          maw={"15rem"}
          h={"70vh"}
          mih={"0"}
          style={styles}
        >
          <Flex direction={"column"} className="gap-1.5 h-full">
            <Flex
              direction={"column"}
              className="overflow-y-auto h-full beautifulScrollBar gap-0.5"
            >
              <DrawerHeader />
              <HistoryTimeline />
            </Flex>
          </Flex>
        </Paper>
      )}
    </Transition>
  );
}

function DrawerHeader() {
  return (
    <Flex direction={"row"} justify={"space-between"} align={"center"}>
      <Text fw={700} size="md" lh={"h4"}>
        Version History
      </Text>
    </Flex>
  );
}

function HistoryTimeline() {
  const { changelogs, activeChangelog, selectChangelog } = useChangelogRepo();

  const { selectedProject, loadProjectData } = useProjectRepo();

  const handleSelectLog = async (changelog: IChangelog) => {
    if (!selectedProject) return;
    if (!selectedProject.id) return;

    const res = await selectChangelog(selectedProject.id, changelog);

    if (res.success) {
      const projectData = JSON.parse(
        res.data.changelog.data
      ) as IEditorDataSnapshot;
      loadProjectData(projectData);
    }
  };

  return (
    <Box
      py="xs"
      px={6}
      className="w-full h-full overflow-x-auto beautifulScrollBar"
    >
      <Timeline
        active={20}
        reverseActive
        bulletSize={8}
        lineWidth={2}
        align="right"
      >
        {changelogs.map((item, idx) => (
          <Timeline.Item key={item.id}>
            <HistoryItem
              dateTime={new Date(item.createdAt)}
              currentVersion={
                activeChangelog ? activeChangelog.id == item.id : idx === 0
              }
              memberChanges={item.members || []}
              onClick={() => handleSelectLog(item)}
            />
          </Timeline.Item>
        ))}
      </Timeline>
    </Box>
  );
}

interface HistoryItemProps {
  dateTime: Date;
  currentVersion: boolean;
  memberChanges: IMember[];
  onClick: () => void;
}

function HistoryItem({
  dateTime,
  currentVersion,
  memberChanges,
  onClick,
}: HistoryItemProps) {
  const dateFormat = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const timeFormat = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <UnstyledButton
      className="w-full flex flex-col items-end px-2 py-1 rounded-md transition-colors hover:bg-neutral-500 hover:bg-opacity-20"
      pr="xs"
      py={3}
      onClick={onClick}
    >
      <Stack gap={0} align="end">
        <Text c="dimmed" size="sm">
          {timeFormat.format(dateTime)}
        </Text>
        <Text fw={500}>{dateFormat.format(dateTime)}</Text>
      </Stack>
      {currentVersion ? (
        <Text c="dimmed" fs="italic" size="xs" mt={4}>
          Current Version
        </Text>
      ) : null}

      <Stack gap={0} align="end">
        {memberChanges.slice(0, 3).map((member) => (
          <Text key={member.id} c="dimmed" size="sm">
            {member.displayName}
          </Text>
        ))}
        {memberChanges.length > 3 ? (
          <Text c="dimmed" size="sm">{`+${
            memberChanges.length - 3
          } more`}</Text>
        ) : null}
      </Stack>
    </UnstyledButton>
  );
}

export default TopRightBar;
