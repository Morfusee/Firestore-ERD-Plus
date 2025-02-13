import {
  Box,
  Button,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
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

function DownloadModal({ context, id, innerProps }: ContextModalProps) {

  const { getProjectDetails } = useDownloadRepo();

  const projectDetails = getProjectDetails();

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
      case "JSON": {
        downloadAsJson(values, projectDetails);
        break;
      }

      default: {
        console.log("Download as Image");
        break;
      }
    }
  };

  const downloadAsJson = (
    values: DownloadModalFormValues,
    projectDetails: DownloadModalProjectDetails
  ) => {
    const stringifiedData =
      "data:application/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(projectDetails));

    // Create a proxy download button to download the file
    const proxyDownloadButton = document.createElement("a");
    proxyDownloadButton.setAttribute("href", stringifiedData);
    proxyDownloadButton.setAttribute("download", `${values.fileName}.json`);

    // Append the button to the body and "click" it
    document.body.appendChild(proxyDownloadButton);
    proxyDownloadButton.click();
    proxyDownloadButton.remove();
  };

  const downloadAsPng = () => {
    
  }

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
