import {
  Flex,
  Button,
  Text,
  Tabs,
  SegmentedControl,
  rem,
  useMantineColorScheme,
  NumberInput,
  Divider,
  MantineColorScheme,
} from "@mantine/core";
import { ContextModalProps, closeModal } from "@mantine/modals";
import { useEffect } from "react";
import { IconEye, IconBuilding } from "@tabler/icons-react";
import { useUserStore } from "../../store/useUserStore";
import { BackgroundVariant } from "@xyflow/react";
import { useSettingsRepo } from "../../data/repo/useSettingsRepo";

function SettingsModal({ context, id }: ContextModalProps) {
  const { currentUser } = useUserStore();
  const { settings, fetchUserSettings, updateUserSettings, updateSettings } =
    useSettingsRepo();
  const { setColorScheme } = useMantineColorScheme({ keepTransitions: true });

  useEffect(() => {
    context.updateModal({
      modalId: id,
      title: (
        <Text fw={700} size="xl">
          {"Settings"}
        </Text>
      ),
      size: "lg",
      centered: true,
    });

    if (currentUser?.id) {
      fetchUserSettings(currentUser.id);
    }
  }, []);

  const handleSave = async () => {
    if (currentUser?.id && settings) {
      await updateUserSettings(currentUser.id, settings);
      closeModal(id);
    }
  };

  return (
    <>
      <Tabs
        defaultValue="general"
        variant="pills"
        orientation="vertical"
        className="flex gap-3 min-h-96"
      >
        <Tabs.List miw={rem(180)} className="font-semibold">
          <Tabs.Tab
            value="general"
            leftSection={<IconBuilding size={"1.1rem"} />}
          >
            General
          </Tabs.Tab>
          <Tabs.Tab
            value="appearance"
            leftSection={<IconEye size={"1.1rem"} />}
          >
            Appearance
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="general">
          <Flex direction={"column"} gap={"lg"}>
            <Flex direction={"column"}>
              <Text fw={500} size="lg">
                General
              </Text>
              <Text opacity={"70%"} size="sm">
                Configure general settings
              </Text>
            </Flex>
            <Divider />
            <Flex direction={"column"} gap={"xs"}>
              <Flex direction={"column"}>
                <Text fw={500}>Auto Save</Text>
                <Text opacity={"70%"} size="xs">
                  Enable auto save by specifying the interval in seconds. Enter
                  "0" to disable auto save.
                </Text>
              </Flex>
              <NumberInput
                placeholder="Interval in seconds"
                allowNegative={false}
                allowDecimal={false}
                value={settings?.autoSaveInterval ?? 0}
                onChange={(value) =>
                  updateSettings("autoSaveInterval", Number(value))
                }
              />
            </Flex>
          </Flex>
        </Tabs.Panel>

        <Tabs.Panel value="appearance">
          <Flex direction={"column"} gap={"lg"}>
            <Flex direction={"column"}>
              <Text fw={500} size="lg">
                Appearance
              </Text>
              <Text opacity={"70%"} size="sm">
                Change how Firestore ERD looks
              </Text>
            </Flex>
            <Divider />
            <Flex direction={"column"} gap={"xs"}>
              <Flex direction={"column"}>
                <Text fw={500}>Interface Theme</Text>
                <Text opacity={"70%"} size="xs">
                  Choose between light and dark mode
                </Text>
              </Flex>
              <SegmentedControl
                size="xs"
                data={["Light", "Dark"]}
                value={settings?.theme ?? "Light"}
                onChange={(value) => {
                  const theme = value as "Light" | "Dark";
                  updateSettings("theme", theme);
                  setColorScheme(theme.toLowerCase() as MantineColorScheme);
                }}
              />
            </Flex>
            <Flex direction={"column"} gap={"xs"}>
              <Flex direction={"column"}>
                <Text fw={500}>Canvas Background</Text>
                <Text opacity={"70%"} size="xs">
                  Select a background pattern for your canvas.
                </Text>
              </Flex>
              <SegmentedControl
                size="xs"
                data={["Dots", "Lines", "Cross"]}
                value={settings?.canvasBackground}
                onChange={(value) =>
                  updateSettings("canvasBackground", value as BackgroundVariant)
                }
              />
            </Flex>
          </Flex>
        </Tabs.Panel>
      </Tabs>

      <Flex justify="flex-end" mt="md">
        <Button onClick={handleSave} variant="outline">
          Save
        </Button>
      </Flex>
    </>
  );
}

export default SettingsModal;
