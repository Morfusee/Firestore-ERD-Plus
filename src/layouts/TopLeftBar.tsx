import {
  Flex,
  ActionIcon,
  Paper,
  Text,
  Button,
  useMantineColorScheme,
  Modal,
  TextInput,
  Combobox,
  useCombobox,
  InputBase,
  Input,
  rem,
  Menu,
  Burger,
  Transition,
  Box,
  Pagination,
  useMantineTheme,
  Tabs,
  ComboboxOptionProps,
  Dialog,
  ThemeIcon,
  HoverCard,
  Loader,
} from "@mantine/core";
import {
  IconMenu2,
  IconArrowBackUp,
  IconSettings,
  IconPlus,
  IconSchool,
  IconMoon,
  IconSun,
  Icon,
  IconProps,
  IconBriefcase2,
  IconDots,
  IconTrash,
  IconEdit,
  IconCopy,
  IconX,
  IconMessageCircle,
  IconPhoto,
  IconCheck,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import useIsDarkMode from "../hooks/useIsDarkMode";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  useDisclosure,
  useHotkeys,
  useLocalStorage,
  useViewportSize,
} from "@mantine/hooks";
import { EmojiData, EmojiGroup } from "../types/EmojiData";
import Virtualizer, { Refs } from "../components/utils/Virtualizer";
import EmojiPicker from "../components/ui/EmojiPicker";
import { useEmojiStore } from "../store/globalStore";
import { useProjectStore } from "../store/useProjectStore";
import { DrawerModalFormValues } from "../types/TopLeftBarTypes";
import useProjectRepo from "../data/repo/useProjectRepo";
import useEmojiRepo from "../data/repo/useEmojiRepo";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../data/db/db";
import { IProject } from "../types/ProjectTypes";
import useProjectIcon from "../hooks/useProjectIcon";
import { notifications } from "@mantine/notifications";
import useIsTruncated from "../hooks/useIsTruncated";
import ConditionalHoverCard from "../components/ui/ConditionalHoverCard";
import useHistoryRepo from "../data/repo/useHistoryRepo";
import {
  unstable_usePrompt,
  useBlocker,
  useNavigate,
  useParams,
} from "react-router-dom";
import useEditorRepo from "../data/repo/useEditorRepo";
import { useEditorStore } from "../store/useEditorStore";
import { modals } from "@mantine/modals";
import AsyncEmojiPicker from "../components/ui/AsyncEmojiPicker";
import DrawerModal from "../components/modals/DrawerModal";
import {
  createProjectApi,
  deleteProjectApi,
  editProjectApi,
} from "../data/api/projectsApi";
import { StatusIcon } from "../components/icons/StatusIcon";
import { determineTitle, isSuccessStatus } from "../utils/successHelpers";
import useUserRepo from "../data/repo/useUserRepo";
import useChangelogRepo from "../data/repo/useChangelogRepo";

function TopLeftBar() {
  const [drawerLocalStorage, setDrawerLocalStorage] = useLocalStorage({
    key: "drawer",
    defaultValue: false,
  });

  const toggleDrawer = () => {
    setDrawerLocalStorage(!drawerLocalStorage);
  };

  const openedDrawer = drawerLocalStorage;

  return (
    <Flex
      className="p-5 absolute z-10 top-0 left-0"
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
  const { toggleColorScheme } = useMantineColorScheme();
  const isDarkMode = useIsDarkMode();
  const { height, width } = useViewportSize();

  const { onSave, onUndo, canUndo, canRedo, onRedo } = useHistoryRepo();
  const { saveChangelog } = useChangelogRepo();
  const { hasPendingChanges } = useEditorStore();

  const handleSave = async () => {
    const res = await onSave()

    if (res?.success) {
      const changelog = res.data.changelog
      await saveChangelog(changelog)
    }
  }

  return (
    <Flex
      gap="sm"
      justify="flex-start"
      direction={width < 900 ? "column" : "row"}
      wrap="wrap"
    >
      <ActionIcon variant="subtle" size="lg" radius="xl" onClick={toggleDrawer}>
        {openedDrawer ? <IconX /> : <IconMenu2 />}
      </ActionIcon>
      <ActionIcon
        variant="subtle"
        size="lg"
        radius="xl"
        onClick={onUndo}
        disabled={!canUndo}
      >
        <IconArrowBackUp />
      </ActionIcon>
      <ActionIcon
        variant="subtle"
        size="lg"
        radius="xl"
        onClick={onRedo}
        disabled={!canRedo}
      >
        <IconArrowBackUp
          style={{
            transform: "scaleX(-1)",
          }}
        />
      </ActionIcon>
      <ActionIcon
        variant="subtle"
        size="lg"
        radius="xl"
        onClick={() => handleSave()}
      >
        {hasPendingChanges ? <Loader size={"sm"} /> : <IconDeviceFloppy />}
      </ActionIcon>
      <ActionIcon
        variant="subtle"
        size="lg"
        radius="xl"
        onClick={() =>
          modals.openContextModal({
            modal: "settings",
            innerProps: {},
          })
        }
      >
        <IconSettings />
      </ActionIcon>
      <ActionIcon
        variant="subtle"
        size="lg"
        radius="xl"
        onClick={toggleColorScheme}
      >
        {isDarkMode ? <IconSun /> : <IconMoon />}
      </ActionIcon>
    </Flex>
  );
}

function Drawer({ opened }: { opened: boolean }) {
  // Get projects
  const { getProjectsList } = useProjectRepo();
  const projects = getProjectsList();

  return (
    <Transition
      mounted={opened}
      transition="slide-right"
      duration={250}
      timingFunction="ease"
    >
      {(styles) => (
        <Paper
          radius="md"
          p="xs"
          miw={"15rem"}
          maw={"15rem"}
          h={"50vh"}
          mih={"0"}
          style={styles}
        >
          <Flex direction={"column"} className="gap-1.5 h-full">
            <DrawerHeader />
            <Flex
              direction={"column"}
              className="overflow-y-auto h-full beautifulScrollBar gap-0.5"
            >
              {projects &&
                projects.map((project) => (
                  <DrawerItems project={project} key={project.id} />
                ))}
            </Flex>
          </Flex>
        </Paper>
      )}
    </Transition>
  );
}

function DrawerHeader() {
  const { addProject, selectProject } = useProjectRepo();
  const { loadChangelogs } = useChangelogRepo();
  const { user } = useUserRepo();
  const navigate = useNavigate();

  const handleCreateProject = async (values: DrawerModalFormValues) => {

    if (!user) return;

    // Get status of response
    const response = await addProject(values.name, values.icon, user.id)

    // Only attempt to add the project if the success status is true
    if (response.success) {

      // Select the project on creation in STATE
      selectProject(response.data.createdProject.id);

      loadChangelogs(response.data.createdProject.id)

      // Navigate/Enter the project on creation
      navigate(`/${response.data.createdProject.id}`);
    }

    // Show notification
    notifications.show({
      icon: <StatusIcon status={response.success ? "success" : "error"} />,
      withBorder: true,
      autoClose: 5000,
      title: determineTitle(
        "Project Created",
        "Failed to Create Project",
        response.success
      ),
      message: response.message,
    });

    return response;
  };

  return (
    <Flex direction={"row"} justify={"space-between"} align={"center"}>
      <Text fw={700} size="md" lh={"h4"}>
        Projects
      </Text>
      <ActionIcon
        variant="subtle"
        size="xs"
        radius="xl"
        onClick={() =>
          modals.openContextModal({
            modal: "drawer",
            innerProps: {
              mode: "create",
              handleOptimisticUpdate: handleCreateProject,
            },
          })
        }
      >
        <IconPlus />
      </ActionIcon>
    </Flex>
  );
}

function DrawerItems({ project }: { project: IProject }) {
  const navigate = useNavigate();
  const { selectedProject } = useProjectRepo();
  const { id: projectId, name: projectName, icon: projectIconHex } = project;
  const isDarkMode = useIsDarkMode();
  const { isTruncated, textRef } =
    useIsTruncated<HTMLParagraphElement>(projectName);

  const openMenu = <T,>(
    e: React.MouseEvent<T, MouseEvent>,
    open: () => void,
    opened: boolean
  ) => {
    e.stopPropagation();

    if (e.type === "contextmenu") {
      e.preventDefault();
    }

    open();
  };

  const { projectIcon, isProjectSelected } = useProjectIcon(
    projectIconHex,
    selectedProject,
    projectId
  );

  const { selectProject } = useProjectRepo()
  const { loadChangelogs } = useChangelogRepo();

  return (
    <DrawerItemMenu project={project}>
      {(open, opened) => (
        <Button
          onContextMenu={(e) => openMenu(e, open, opened)}
          component="div"
          justify="flex-start"
          style={{
            "--button-padding-x": "0.7rem",
            "--button-bg": isProjectSelected
              ? isDarkMode
                ? "var(--mantine-color-dark-5)"
                : "var(--mantine-color-gray-3)"
              : "none",
          }}
          variant="subtle"
          leftSection={<Text>{projectIcon}</Text>}
          radius={"sm"}
          mih={"2.25rem"}
          classNames={{
            root: "group/rightSection relative",
          }}
          onClick={() => {
            navigate(`/${project.id}`, { replace: true });
            selectProject(project.id);
            loadChangelogs(project.id)
          }}
          rightSection={
            <ActionIcon
              className={
                "group-hover/rightSection:opacity-100 opacity-0 " +
                (opened ? "opacity-100" : "")
              }
              style={{
                position: "absolute",
                right: "0.5rem",
              }}
              variant="shadow"
              size={"sm"}
              radius={"xl"}
              onClick={(e) => openMenu(e, open, opened)}
            >
              <IconDots size={"1.1rem"} />
            </ActionIcon>
          }
        >
          <ConditionalHoverCard
            dropdownText={projectName}
            showDropdown={isTruncated}
          >
            <Text ref={textRef} truncate="end" inherit>
              {projectName}
            </Text>
          </ConditionalHoverCard>
        </Button>
      )}
    </DrawerItemMenu>
  );
}

function DrawerItemMenu({
  project,
  children,
}: {
  project: IProject;
  children: (open: () => void, opened: boolean) => React.ReactNode;
}) {
  // Router
  const navigate = useNavigate();
  const params = useParams();

  // State
  const {
    selectProject,
    duplicateProject,
    deleteProject,
    editProject,
    clearProject,
  } = useProjectRepo();
  const [
    isDrawerItemMenuOpen,
    { open: openDrawerItemMenu, close: closeDrawerItemMenu },
  ] = useDisclosure(false);

  const handleEditProject = async (
    values: DrawerModalFormValues,
    projectId: IProject["id"]
  ) => {

    if (!projectId) return

    const res = await editProject(
      projectId,
      values.name,
      values.icon,
    );

    // Only attempt to locally edit the project if the success status is true
    if (res?.success) {

      // If the user is currently editing the selected project,
      // just reselect the project to update the values.
      if (params.projectId == res.data.updatedProject.id) selectProject(params.projectId);
    }

    // Show notification
    notifications.show({
      icon: <StatusIcon status={res?.success ? "success" : "error"} />,
      withBorder: true,
      autoClose: 5000,
      title: determineTitle("Project Edited", "Failed to Edit Project", res?.success || false),
      message: res?.message,
    });

    return res;
  };

  const handleDuplicate = () => {
    duplicateProject(project?.id!);
  };

  const handleDelete = async () => {
    // If id doesn't exist, return
    if (!project.id) return;

    // Delete project from DB

    // Delete project from store
    const res = await deleteProject(project.id);

    // Check if the current project is the one that's deleted
    if (res.success && params.projectId == res.data.deletedProjectId) {
      // Navigate to "/" if the deleted project is the current project the user is on.
      navigate("/");

      // Reset the selectedProject field
      clearProject();
    }

    // Show notification after deleting
    notifications.show({
      icon: <StatusIcon status={res.success ? "success" : "error"} />,
      withBorder: true,
      autoClose: 5000,
      message: res.message,
    });
  };

  return (
    <Menu
      keepMounted={false}
      shadow="lg"
      width={"10rem"}
      opened={isDrawerItemMenuOpen}
      onClose={closeDrawerItemMenu}
      withArrow
      position="right"
      clickOutsideEvents={["click", "mousedown", "mouseup", "pointerdown"]}
    >
      <Menu.Target>
        {children(openDrawerItemMenu, isDrawerItemMenuOpen)}
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconEdit size={"1rem"} />}
          onClick={() =>
            modals.openContextModal({
              modal: "drawer",
              innerProps: {
                mode: "edit",
                project: project,
                handleOptimisticUpdate: handleEditProject,
              },
            })
          }
        >
          Edit
        </Menu.Item>
        <Menu.Item
          leftSection={<IconCopy size={"1rem"} />}
          onClick={handleDuplicate}
        >
          Duplicate
        </Menu.Item>
        <Menu.Item
          color="red"
          leftSection={<IconTrash size={"1rem"} />}
          onClick={() =>
            modals.openContextModal({
              modal: "delete",
              innerProps: {
                handleDelete: handleDelete,
              },
            })
          }
        >
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export default TopLeftBar;
