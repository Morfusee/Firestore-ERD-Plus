import { Box, Button, Group, Stack, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { ContextModalProps } from "@mantine/modals";
import { useCallback, useEffect, useState } from "react";
import { CircleStencil, Cropper, CropperRef } from "react-advanced-cropper";
import useUserRepo from "../../data/repo/useUserRepo";
import { useDebouncedCallback } from "@mantine/hooks";

function ImageCropperModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  image: string;
}>) {
  const { user, setProfileImage } = useUserRepo();

  const [imageData, setImageData] = useState<string>(innerProps.image);

  useEffect(() => {
    context.updateModal({
      modalId: id,
      title: (
        <Text fw={700} size="xl">
          {"Crop Image"}
        </Text>
      ),
      size: "md",
      centered: false,
    });
  }, []);

  const handleSubmit = async () => {
    if (!user || !user.id) return;

    // Update the user profile image in state only
    setProfileImage(imageData);

    // Close the modal
    context.closeModal(id);
  };

  // useDebouncedCallback to prevent the cropper from
  // updating too frequently
  const onChange = useDebouncedCallback((cropper: CropperRef) => {
    const canvas = cropper.getCanvas();
    if (canvas) {
      setImageData(canvas.toDataURL());
    }
  }, 1);

  return (
    <Box className="">
      <Stack px="md">
        <Cropper
          stencilComponent={CircleStencil}
          src={innerProps.image}
          onChange={onChange}
          className={"cropper"}
        />
        <Group justify="space-between" mt="lg">
          <Group>
            <Button variant="default" onClick={handleSubmit}>
              Save
            </Button>
            <Button variant="light" onClick={() => context.closeModal(id)}>
              Cancel
            </Button>
          </Group>
        </Group>
      </Stack>
    </Box>
  );
}

export default ImageCropperModal;
