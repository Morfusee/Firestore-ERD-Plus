import { Box, Text } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
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

    </Box>
  )
}


export default ManageAccountModal