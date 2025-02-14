import {
  Avatar,
  Box,
  Button,
  FileButton,
  Group,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { ContextModalProps, modals } from "@mantine/modals";
import { IconTrash, IconUpload } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Cropper, CropperRef } from "react-advanced-cropper";
import useUserRepo from "../../data/repo/useUserRepo";

function ManageAccountModal({ context, id, innerProps }: ContextModalProps) {
  const { user, changeUserDisplayname } = useUserRepo();

  useEffect(() => {
    context.updateModal({
      modalId: id,
      title: (
        <Text fw={700} size="xl">
          {"Manage Account"}
        </Text>
      ),
      size: "md",
      centered: false,
    });
  }, []);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      image: user?.profileImage || "",
      name: "",
    },
    validate: {
      image: (value) => {
        if (!value) {
          return "Image is required";
        }
      },
      name: (value) => {
        if (!value) {
          return "Name is required";
        }
      },
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!user || !user.id || !values.name) return;

    // Add the project to DB and State
    await changeUserDisplayname(user?.id, values.name);

    // Reset form and close modal
    form.reset();
    context.closeModal(id);
  };

  const onUpload = (selectedFile: File | null) => {
    if (!selectedFile) return;

    // Create a URL for the selected file
    const dataUrl = URL.createObjectURL(selectedFile);

    // Open the crop image modal
    modals.openContextModal({
      onClose: () => {
        // Revoke the object URL to free up memory
        URL.revokeObjectURL(dataUrl);
      },
      modal: "cropImage",
      innerProps: {
        image: dataUrl,
      },
    });
  };

  return (
    <Box className="">
      <form
        onSubmit={form.onSubmit((values: typeof form.values) =>
          handleSubmit(values)
        )}
      >
        <Stack px="md">
          <Group ml="lg" align="center" gap="md">
            <Avatar size={100} src={form.getValues().image} />
            <Group gap="xs">
              <FileButton onChange={onUpload} accept="image/*">
                {(props) => (
                  <Button
                    {...props}
                    variant="default"
                    leftSection={<IconUpload size={16} />}
                  >
                    Upload
                  </Button>
                )}
              </FileButton>
              <Button variant="subtle" leftSection={<IconTrash size={16} />}>
                Remove
              </Button>
            </Group>
          </Group>

          <Stack gap="sm">
            <TextInput
              size="md"
              label="Name"
              defaultValue={user?.displayName}
              withAsterisk
              placeholder="Enter name here..."
              key={form.key("name")}
              {...form.getInputProps("name")}
            />
            <TextInput
              size="md"
              label="Email"
              value={user?.email}
              disabled
              readOnly
            />
          </Stack>

          <Group justify="space-between" mt="lg">
            <Group>
              <Button variant="default" type="submit">
                Save
              </Button>
              <Button variant="light" onClick={() => context.closeModal(id)}>
                Cancel
              </Button>
            </Group>

            <Button variant="subtle">Delete Account</Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}

export default ManageAccountModal;
