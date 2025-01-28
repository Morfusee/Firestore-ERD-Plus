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
import useIsDarkMode from "../utils/useIsDarkMode";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  useDisclosure,
  useHotkeys,
  useLocalStorage,
  useViewportSize,
} from "@mantine/hooks";
import { EmojiData, EmojiGroup } from "../types/EmojiData";
import Virtualizer, { Refs } from "./Virtualizer";
import EmojiPicker from "./EmojiPicker";
import { useEmojiStore } from "../store/globalStore";
import { useProjectStore } from "../store/useProjectStore";
import { DrawerModalFormValues } from "../types/TopLeftBarTypes";
import useProjectRepo from "../data/repo/useProjectRepo";
import useEmojiRepo from "../data/repo/useEmojiRepo";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../data/db/db";
import { IProject } from "../types/ProjectTypes";
import useProjectIcon from "../utils/useProjectIcon";
import { notifications } from "@mantine/notifications";
import useIsTruncated from "../utils/useIsTruncated";
import ConditionalHoverCard from "./ConditionalHoverCard";
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
import AsyncEmojiPicker from "./AsyncEmojiPicker";

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
  const { hasPendingChanges } = useEditorStore();

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
        onClick={() => onSave()}
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
  const { projects } = useProjectStore((state) => state);
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
              {projects.map((project) => (
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
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Flex direction={"row"} justify={"space-between"} align={"center"}>
      <Text fw={700} size="md" lh={"h4"}>
        Projects
      </Text>
      <ActionIcon variant="subtle" size="xs" radius="xl" onClick={open}>
        <IconPlus />
      </ActionIcon>
      <DrawerModal mode="create" opened={opened} close={close} />
    </Flex>
  );
}

function DrawerModal({
  mode,
  project,
  opened,
  close,
}: {
  mode: "create" | "edit";
  project?: IProject;
  opened: boolean;
  close: () => void;
}) {
  const { addProject, editProject } = useProjectRepo();
  const { getHexByEmoji } = useEmojiRepo();
  const [emojiList, setEmojiList] = useState<EmojiGroup>({
    smileysEmotion: [],
    peopleBody: [],
    animalsNature: [],
    foodDrink: [],
    travelPlaces: [],
    activities: [],
    objects: [],
    symbols: [],
    component: [],
  });

  const {
    activities,
    animalsNature,
    component,
    foodDrink,
    objects,
    peopleBody,
    smileysEmotion,
    symbols,
    travelPlaces,
  } = useEmojiStore();

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => {
      combobox.resetSelectedOption();
      setEmojiList({
        smileysEmotion,
        peopleBody,
        animalsNature,
        foodDrink,
        travelPlaces,
        activities,
        objects,
        symbols,
        component,
      });
    },
  });

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      icon: "",
    },
    validate: {
      name: (value) => {
        if (!value.trim()) {
          return "Name is required";
        }
      },
      icon: (value) => {
        if (!value.trim()) {
          return "Icon is required";
        }
      },
    },
  });

  const { projectIcon, isProjectSelected } = useProjectIcon(
    project?.icon || "",
    project || null,
    project?.id
  );

  const [comboboxValue, setComboboxValue] = useState<string>("");

  // There's no other way to set initial values for the edit mode
  useEffect(() => {
    if (mode === "edit" && opened) {
      form.setFieldValue("name", project?.name!);
      form.setFieldValue("icon", project?.icon!);
    }

    return () => {
      form.reset();
    };
  }, [opened]);

  const comboboxOnOptionSubmit = (value: string) => {
    getHexByEmoji(value).then((hex) => {
      if (!hex) return;

      form.setFieldValue("icon", hex);
      setComboboxValue(value);
      combobox.closeDropdown();
    });
  };

  const modalOnClose = () => {
    close();
    setComboboxValue("");
    setEmojiList({
      smileysEmotion: [],
      peopleBody: [],
      animalsNature: [],
      foodDrink: [],
      travelPlaces: [],
      activities: [],
      objects: [],
      symbols: [],
      component: [],
    });
  };

  const addFormSubmit = (values: DrawerModalFormValues) => {
    addProject(values.name, values.icon);
    form.reset();
    modalOnClose();
    notifications.show({
      icon: (
        <ThemeIcon variant="filled" radius={"xl"}>
          <IconCheck size={"1.25rem"} />
        </ThemeIcon>
      ),
      withBorder: true,
      autoClose: 3000,
      title: "Project Added",
      message: "Project has been added successfully.",
    });
  };

  const editFormSubmit = (values: DrawerModalFormValues) => {
    editProject(project?.id!, values.name, values.icon);
    form.reset();
    modalOnClose();
    notifications.show({
      icon: (
        <ThemeIcon variant="filled" radius={"xl"}>
          <IconCheck size={"1.25rem"} />
        </ThemeIcon>
      ),
      withBorder: true,
      autoClose: 3000,
      title: "Project Updated",
      message: "Project has been updated successfully.",
    });
  };

  const modeToggler = useMemo(() => {
    switch (mode) {
      case "create":
        return {
          title: "Create Project",
          submit: addFormSubmit,
        };
      case "edit":
        return {
          title: "Edit Project",
          submit: editFormSubmit,
        };
    }
  }, []);

  return (
    <Modal
      opened={opened}
      onClose={modalOnClose}
      title={
        <Text fw={700} size="md" lh={"h4"}>
          {modeToggler.title}
        </Text>
      }
      centered
    >
      <form onSubmit={form.onSubmit((values) => modeToggler.submit(values))}>
        <Flex gap={"xs"} direction={"column"}>
          <TextInput
            label="Name"
            classNames={{
              label: "mb-1",
            }}
            required
            placeholder="(e.g. LMS System)"
            key={form.key("name")}
            {...form.getInputProps("name")}
            defaultValue={project?.name}
          />
          <AsyncEmojiPicker
            combobox={combobox}
            comboboxValue={comboboxValue || projectIcon || ""}
            comboboxOnOptionSubmit={comboboxOnOptionSubmit}
          />
          <Flex direction={"row"} gap={"xs"} justify={"flex-end"} pt={"md"}>
            <Button variant="subtle" onClick={close}>
              Cancel
            </Button>
            <Button variant="filled" type="submit">
              Confirm
            </Button>
          </Flex>
        </Flex>
      </form>
    </Modal>
  );
}

function DrawerItems({ project }: { project: IProject }) {
  const navigate = useNavigate();
  const { selectedProject, selectProject } = useProjectRepo();
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
            // selectProject(project.id);
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
  const { addProject, duplicateProject, deleteProject } = useProjectRepo();
  const [
    isDrawerItemMenuOpen,
    { open: openDrawerItemMenu, close: closeDrawerItemMenu },
  ] = useDisclosure(false);

  const [
    isDrawerModalOpen,
    { open: openDrawerModal, close: closeDrawerModal },
  ] = useDisclosure(false);

  const handleEdit = () => {
    openDrawerModal();
  };

  const handleDuplicate = () => {
    duplicateProject(project?.id!);
  };

  const handleDelete = () => {
    deleteProject(project?.id!);
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
          onClick={handleEdit}
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

      <>
        <DrawerModal
          close={closeDrawerModal}
          mode="edit"
          opened={isDrawerModalOpen}
          project={project}
        />
      </>
    </Menu>
  );
}

export default TopLeftBar;
