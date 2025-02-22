import {
  Box,
  Button,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { ContextModalProps } from "@mantine/modals";
import { useEffect } from "react";
import {
  DownloadModalFormValues,
  DownloadModalProjectDetails,
} from "../../types/DownloadModalTypes";
import useProjectRepo from "../../data/repo/useProjectRepo";
import { useEditorStore } from "../../store/useEditorStore";
import useDownloadRepo from "../../data/repo/useDownloadRepo";
import { getViewportForBounds, useReactFlow } from "@xyflow/react";
import { toJpeg, toPng } from "html-to-image";
import { Options } from "html-to-image/lib/types";
import useIsDarkMode from "../../hooks/useIsDarkMode";

function DownloadModal({ context, id, innerProps }: ContextModalProps) {
  // Hook for getting project details for JSON download
  const { getProjectDetails } = useDownloadRepo();
  const projectDetails = getProjectDetails();
  
  // Hook for downloading as JPEG or PNG
  const { getNodes, getNodesBounds } = useReactFlow();

  // Theme
  const theme = useMantineTheme();
  const isDarkMode = useIsDarkMode();

  useEffect(() => {
    context.updateModal({
      modalId: id,
      title: (
        <Text fw={700} size="xl">
          {"Download"}
        </Text>
      ),
      size: "md",
      centered: false,
    });
  }, []);

  // Hook for managing form
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      fileName: "" as DownloadModalFormValues["fileName"],
      fileType: "" as DownloadModalFormValues["fileType"],
    },
    validate: {
      fileName: (value) => {
        if (!value.trim()) {
          return "File Name is required";
        }
      },
      fileType: (value) => {
        if (!value.trim()) {
          return "File Type is required";
        }
      },
    },
  });

  const handleDownload = (values: DownloadModalFormValues) => {
    switch (values.fileType) {
      case "JSON":
        downloadAsJson(values, projectDetails);
        break;

      case "PNG":
        downloadAsPng(values);
        break;

      case "JPEG":
        downloadAsJpeg(values);
        break;

      default:
        break;
    }
  };

  /**
   * Responsible for creating a proxy download button to download the file
   *
   * @param fileName - Name of the file
   * @param dataUrl - Data URL of the image
   *
   * @returns void
   **/
  const downloadFile = (
    fileName: DownloadModalFormValues["fileName"],
    dataUrl: string
  ): void => {
    // Create a proxy download button to download the file
    const proxyDownloadButton = document.createElement("a");
    proxyDownloadButton.setAttribute("href", dataUrl);
    proxyDownloadButton.setAttribute("download", fileName);
    proxyDownloadButton.click();
    proxyDownloadButton.remove();
  };

  /**
   * Responsible for getting the export settings for the image
   *
   * @param imageWidth
   * @param imageHeight
   * @param transform
   * @returns Options
   */
  const getExportSettings = (
    imageWidth: number,
    imageHeight: number,
    transform: { x: number; y: number; zoom: number },
    backgroundColor?: string
  ): Options => {
    return {
      filter: (node) =>
        !(
          node?.classList?.contains("react-flow__minimap") ||
          node?.classList?.contains("react-flow__controls")
        ),
      backgroundColor: backgroundColor || "transparent",
      width: imageWidth,
      height: imageHeight,
      style: {
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
      },
    };
  };

  /**
   * Responsible for downloading the project details as JSON
   *
   * @param values
   * @param projectDetails
   * @returns void
   */
  const downloadAsJson = (
    values: DownloadModalFormValues,
    projectDetails: DownloadModalProjectDetails
  ) => {
    const dataUrl =
      "data:application/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(projectDetails));

    const fileName = values.fileName + ".json";

    // Download the file
    downloadFile(fileName, dataUrl);
  };

  /**
   * Responsible for downloading the image as PNG
   *
   * @param values
   * @returns void
   */
  const downloadAsPng = (values: DownloadModalFormValues) => {
    const nodesBounds = getNodesBounds(getNodes());
    const imageWidth = 1920;
    const imageHeight = 1080;

    const transform = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0,
      1,
      0
    );

    toPng(
      document.querySelector(".react-flow__viewport") as HTMLElement,
      getExportSettings(imageWidth, imageHeight, transform)
    ).then((dataUrl) => {
      const fileName = values.fileName + ".png";
      // Download the file
      downloadFile(fileName, dataUrl);
    });
  };

  /**
   * Responsible for downloading the image as JPEG
   *
   * @param values
   */
  const downloadAsJpeg = (values: DownloadModalFormValues) => {
    const nodesBounds = getNodesBounds(getNodes());
    const imageWidth = 1920;
    const imageHeight = 1080;

    const transform = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0,
      1,
      0
    );

    toJpeg(
      document.querySelector(".react-flow__viewport") as HTMLElement,
      getExportSettings(
        imageWidth,
        imageHeight,
        transform,
        isDarkMode ? theme.colors.dark[8] : theme.colors.gray[3] // Set background color based on theme
      )
    ).then((dataUrl) => {
      const fileName = values.fileName + ".jpeg";
      // Download the file
      downloadFile(fileName, dataUrl);
    });
  };

  return (
    <Box component="form" onSubmit={form.onSubmit(handleDownload)}>
      <Stack>
        <TextInput
          label="File Name"
          key={form.key("fileName")}
          {...form.getInputProps("fileName")}
        />
        <Select
          allowDeselect={false}
          label="File Type"
          data={["PNG", "JPEG", "JSON"]}
          key={form.key("fileType")}
          {...form.getInputProps("fileType")}
        />

        <Group justify="end">
          <Button variant="default" type="submit">
            Download
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}

export default DownloadModal;
