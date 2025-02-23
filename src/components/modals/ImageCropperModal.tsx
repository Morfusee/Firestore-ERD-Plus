import {
  Box,
  Button,
  Group,
  LoadingOverlay,
  rem,
  Stack,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { ContextModalProps } from "@mantine/modals";
import { useCallback, useEffect, useState } from "react";
import { CircleStencil, Cropper, CropperRef } from "react-advanced-cropper";
import useUserRepo from "../../data/repo/useUserRepo";
import { useDebouncedCallback } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { StatusIcon } from "../icons/StatusIcon";
import { determineTitle } from "../../utils/successHelpers";
import { APIResponse, FetchedUser } from "../../types/APITypes";

function ImageCropperModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  image: string;
}>) {
  const { user, setProfileImage } = useUserRepo();

  const [file, setFile] = useState<File | null>(null);

  const [isUploading, setIsUploading] = useState<boolean>(false);

  const { uploadProfileImage } = useUserRepo();

  useEffect(() => {
    context.updateModal({
      modalId: id,
      title: (
        <Text fw={700} size="xl">
          {"Crop Image"}
        </Text>
      ),
      size: "xl",
      centered: false,
      closeOnClickOutside: !isUploading,
      closeOnEscape: !isUploading,
      withCloseButton: !isUploading,
    });
  }, [isUploading]);

  const handleSubmit = async () => {
    if (!user || !user.id || !file) return;

    // Toggle loader
    setIsUploading(true);

    try {
      const response = await uploadProfileImage(user.id, file);

      // If the response is successful, show a notification
      showNotification(response);
    } catch (error) {
      console.error("Error uploading profile image:", error);

      // Show a notification if the upload fails
      showNotification({
        success: false,
        message: "Failed to upload profile image",
      } as APIResponse<FetchedUser>);
    }

    // After the image is uploaded, update the profile image
    setIsUploading(false);

    // Close the modal
    context.closeModal(id);
  };

  const showNotification = (response: APIResponse<FetchedUser>) => {
    // Show notification
    notifications.show({
      icon: <StatusIcon status={response.success ? "success" : "error"} />,
      withBorder: true,
      autoClose: 5000,
      title: determineTitle(
        "Profile picture updated",
        "Failed to update profile picture",
        response.success
      ),
      message: response.message,
    });
  };

  // useDebouncedCallback to prevent the cropper from
  // updating too frequently
  const onChange = useDebouncedCallback((cropper: CropperRef) => {
    const canvas = cropper.getCanvas();
    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "profile-picture.png", {
            type: blob.type,
          });
          setFile(file);
        }
      }, "image/png");
    }
  }, 10);

  return (
    <Box className="">
      <Stack px="md">
        <Box className="relative">
          <Cropper
            stencilComponent={CircleStencil}
            src={innerProps.image}
            onChange={onChange}
            className={"cropper rounded-md"}
            style={{ maxHeight: rem(650) }}
          />
          <LoadingOverlay
            visible={isUploading}
            overlayProps={{ radius: "xs", blur: 2 }}
            loaderProps={{ color: "dark.1" }}
          />
        </Box>
        <Group justify="space-between" mt="lg">
          <Group>
            <Button
              variant="default"
              onClick={handleSubmit}
              loading={isUploading}
            >
              Save
            </Button>
            <Button
              variant="light"
              onClick={() => context.closeModal(id)}
              disabled={isUploading}
            >
              Cancel
            </Button>
          </Group>
        </Group>
      </Stack>
    </Box>
  );
}

export default ImageCropperModal;
