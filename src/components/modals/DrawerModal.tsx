import {
  useCombobox,
  ThemeIcon,
  Modal,
  Flex,
  TextInput,
  Button,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { useState, useEffect, useMemo } from "react";
import useEmojiRepo from "../../data/repo/useEmojiRepo";
import useProjectRepo from "../../data/repo/useProjectRepo";
import { useEmojiStore } from "../../store/globalStore";
import { EmojiGroup } from "../../types/EmojiData";
import { IProject } from "../../types/ProjectTypes";
import { DrawerModalFormValues } from "../../types/TopLeftBarTypes";
import useProjectIcon from "../../utils/useProjectIcon";
import AsyncEmojiPicker from "../AsyncEmojiPicker";
import { ContextModalProps } from "@mantine/modals";
import { createProject } from "../../data/api/projectsApi";

function DrawerModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ mode: "create" | "edit"; project?: IProject }>) {
  // Set up the props
  const { mode, project } = innerProps;
  const { editProject } = useProjectRepo();
  const { getHexByEmoji } = useEmojiRepo();
  const { projectIcon, isProjectSelected } = useProjectIcon(
    project?.icon || "",
    project || null,
    project?.id
  );
  const [comboboxValue, setComboboxValue] = useState<string>("");

  // Set up the context
  useEffect(() => {
    context.updateModal({
      modalId: id,
      title: (
        <Text fw={700} size="md" lh={"h4"}>
          {mode === "create" ? "Create Project" : "Edit Project"}
        </Text>
      ),
      centered: true,
    });
  }, [id]);

  // There's no other way to set initial values for the edit mode
  useEffect(() => {
    if (mode === "edit") {
      form.setFieldValue("name", project?.name!);
      form.setFieldValue("icon", project?.icon!);
    }

    return () => {
      form.reset();
    };
  }, []);

  // Combobox event handlers
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.resetSelectedOption(),
  });

  const comboboxOnOptionSubmit = (value: string) => {
    getHexByEmoji(value).then((hex) => {
      if (!hex) return;

      form.setFieldValue("icon", hex);
      setComboboxValue(value);
      combobox.closeDropdown();
    });
  };

  // Hook for managing form
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

  const modalOnClose = () => {
    context.closeModal(id);
    setComboboxValue("");
  };

  const addFormSubmit = (values: DrawerModalFormValues) => {
    createProject(values.name, values.icon);
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
    <form onSubmit={form.onSubmit((values) => modeToggler.submit(values))}>
      <Flex gap={"xs"} direction={"column"}>
        <TextInput
          label="Name"
          classNames={{
            label: "mb-1",
          }}
          withAsterisk
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
          <Button variant="subtle" onClick={() => context.closeAll()}>
            Cancel
          </Button>
          <Button variant="filled" type="submit">
            Confirm
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}

export default DrawerModal;
