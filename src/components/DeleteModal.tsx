import { Modal, Flex, Button, Text } from "@mantine/core";
import { ContextModalProps, closeModal } from "@mantine/modals";
import { useEffect } from "react";

function DeleteModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ handleDelete: () => void; title?: React.ReactNode }>) {
  useEffect(() => {
    context.updateModal({
      modalId: id,
      title: (
        <Text fw={700} size="md" lh={"h4"}>
          {innerProps.title || "Delete Project"}
        </Text>
      ),
      centered: true,
    });
  }, [context, id]);

  return (
    <>
      <Flex direction={"column"} gap={"md"}>
        <Text opacity={"90%"}>
          Are you sure you want to delete this project?
        </Text>
        <Flex direction={"row"} gap={"xs"} justify={"flex-end"}>
          <Button variant="subtle" onClick={() => context.closeModal(id)}>
            Cancel
          </Button>
          <Button
            variant="filled"
            onClick={() => {
              innerProps.handleDelete();
              context.closeModal(id);
            }}
          >
            Delete
          </Button>
        </Flex>
      </Flex>
    </>
  );
}

export default DeleteModal;
