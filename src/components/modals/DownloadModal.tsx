import { Box, Button, Group, Select, Stack, Text, TextInput } from "@mantine/core"
import { ContextModalProps } from "@mantine/modals"
import { useEffect } from "react"



function DownloadModal({ context, id, innerProps }: ContextModalProps) {

  useEffect(() => {
    context.updateModal({
      modalId: id,
      title: (
        <Text fw={700} size="xl">
          {"Download"}
        </Text>
      ),
      size: "md",
      centered: false
    })
  }, [])

  return(
    <Box>
      <Stack>
        <TextInput 
          label="File Name"

        />
        <Select 
          label="File Type"
          data={['PNG', 'JPEG', 'JSON']}
        />

        <Group justify="end">
          <Button variant="default">Download</Button>
        </Group>
      </Stack>
    </Box>
  )
}


export default DownloadModal