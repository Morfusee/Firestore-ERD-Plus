import { ActionIcon, Avatar, Box, Button, CopyButton, Divider, Group, Select, Stack, Text, TextInput, Title } from "@mantine/core"
import { ContextModalProps } from "@mantine/modals"
import { IconCopy, IconLock, IconPlus } from "@tabler/icons-react"
import { useEffect } from "react"


function ShareModal({ context, id, innerProps }: ContextModalProps) {

  useEffect(() => {
    context.updateModal({
      modalId: id,
      title: (
        <Text fw={700} size="xl">
          {"Share Project"}
        </Text>
      ),
      size: "md",
      centered: false
    })
  }, [])


  const members = [
    {
      photoUrl: "",
      name: "Test User",
      email: "test@email.com",
      role: "Viewer"
    }
  ]

  return(
    <Box className="w-full h-full">
      <Group >
        <TextInput
          className="flex-1"
          label="Shareable Link"
          rightSection={
            <CopyButton value="http://localhost.com">
            {({ copied, copy }) => (
              <ActionIcon
                variant="light"
                onClick={copy}
              >
                <IconCopy size={16}/>
              </ActionIcon>
            )}
          </CopyButton>
          }
          readOnly
          value="http://localhost.com"
        />
      </Group>

      <Divider my="md"/>

      <Group justify="space-between">
        <Title order={5}>Members</Title>
        <ActionIcon radius="lg" variant="subtle">
          <IconPlus size={16}/>
        </ActionIcon>
      </Group>

      <Stack my='sm'>
        {
          members.map((member) =>(
            <MemberItem 
              {...member}
            />
          ))
        }
      </Stack>

      <Title order={5} mb="xs">General Access</Title>

      <GeneralItem 
        accessType="restricted"
        role="Viewer"
      />
      
    </Box>
  )
}


interface MemberItemProps {
  photoUrl: string
  name: string
  email: string
  role: string
}


function MemberItem({
  photoUrl,
  name,
  email,
  role,
}: MemberItemProps) {

  return(
    <Group 
      className="rounded-md transition-color hover:bg-neutral-500 hover:hover:bg-opacity-20"
      px="xs" py={6} justify="space-between"
    >
      <Group gap="sm">
        <Avatar 
          size={42}
          src={photoUrl}
        />

        <Stack gap={0}>
          <Text fw={500}>{name}</Text>
          <Text c="dimmed" size="sm">{email}</Text>
        </Stack>
      </Group>


      <Select 
        variant="unstyled"
        w={90}
        comboboxProps={{ width: 110, position: 'bottom-end' }}
        size="md"
        value={role}
        data={['Viewer', 'Editor', 'Admin']}
      />

    </Group>
  )
}


type AccessType = "restricted" | "anyone"

interface GeneralItemProps {
  accessType: AccessType
  role: string
}

function GeneralItem({
  accessType,
  role,
}: GeneralItemProps) {

  const typeDisplay: Record<AccessType, {title: string, subtext: string}> = {
    restricted: {
      title: "Restricted",
      subtext: "",
    },
    anyone: {
      title: "Anyone with a link",
      subtext: "",
    }
  }

  return(
    <Group 
      className="rounded-md transition-color hover:bg-neutral-500 hover:hover:bg-opacity-20"
      px="xs" py={6} justify="space-between"
    >
      <Group gap="sm">
        <Avatar 
          size={42}
          src=""
        >
          <IconLock size={22}/>
        </Avatar>

        <Stack gap={0}>
          <Select 
            variant="unstyled"
            size="md"
            value={typeDisplay[accessType].title}
            data={['Restricted', 'Anyone with a link']}
          />
          <Text c="dimmed" size="sm">{typeDisplay[accessType].subtext}</Text>
        </Stack>
      </Group>


      <Select 
        variant="unstyled"
        w={90}
        comboboxProps={{ width: 110, position: 'bottom-end' }}
        size="md"
        value={role}
        data={['Viewer', 'Editor', 'Admin']}
      />

    </Group>
  )
}



export default ShareModal