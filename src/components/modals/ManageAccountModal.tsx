import { Avatar, Box, Button, Group, Stack, Text, TextInput, Title } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { IconTrash, IconUpload } from "@tabler/icons-react";
import { useEffect } from "react";
import useUserRepo from "../../data/repo/useUserRepo";
import { useForm } from "@mantine/form";


function ManageAccountModal({ context, id, innerProps }: ContextModalProps) {

  const { user, changeUserDisplayname } = useUserRepo()

  useEffect(() => {
    context.updateModal({
      modalId: id,
      title: (
        <Text fw={700} size="xl">
          {"Manage Account"}
        </Text>
      ),
      size: "md",
      centered: false
    });
  }, []);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: user?.displayName || "",
    },
    validate: {
      name: (value) => {
        if (!value.trim()) {
          return "Name is required";
        }
      },
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if(!user || !user.id) return

    // Add the project to DB and State
    await changeUserDisplayname(user?.id, values.name)

    // Reset form and close modal
    form.reset();
    context.closeModal(id)
  };

  return(
    <Box className="">
      <form onSubmit={form.onSubmit((values: typeof form.values) => handleSubmit(values))}>
        <Stack px='md'>

          <Group ml="lg" align="center" gap="md">

            <Avatar 
              size={100}
            />

            <Group gap="xs">
              <Button 
                variant="default"
                leftSection={<IconUpload size={16}/>}
              >
                Upload
              </Button>
              <Button 
                variant="subtle"
                leftSection={<IconTrash size={16}/>}
              >
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
              <Button 
                variant="default"
                type="submit"
              >
                Save
              </Button>
              <Button 
                variant="light"
                onClick={()=>context.closeModal(id)}
              >
                Cancel
              </Button>
            </Group>

            <Button 
              variant="subtle"
            >
              Delete Account
            </Button>
          </Group>

        </Stack>
      </form>
    </Box>
  )
}


export default ManageAccountModal