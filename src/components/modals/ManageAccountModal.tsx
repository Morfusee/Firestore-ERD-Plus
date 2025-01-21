import { Avatar, Box, Button, Group, Stack, Text, TextInput, Title } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { IconTrash, IconUpload } from "@tabler/icons-react";
import { useEffect } from "react";


function ManageAccountModal({ context, id, innerProps }: ContextModalProps) {

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

  return(
    <Box className="">
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
            defaultValue="Test User"
          />
          <TextInput 
            size="md"
            label="Email"
            value="test@email.com"
            disabled
            readOnly
          />
        </Stack>

        <Group justify="space-between" mt="lg">
          <Group>
            <Button 
              variant="default"
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
    </Box>
  )
}


export default ManageAccountModal