import {
  Divider,
  Flex,
  MantineColorScheme,
  NumberInput,
  SegmentedControl,
  Tabs,
  Text,
  rem,
  useMantineColorScheme
} from "@mantine/core";
import { ContextModalProps, closeModal } from "@mantine/modals";
import { IconBuilding, IconEye } from "@tabler/icons-react";
import { BackgroundVariant } from "@xyflow/react";
import { useEffect } from "react";
import { useSettingsRepo } from "../../data/repo/useSettingsRepo";
import { IUserSettings } from "../../store/useSettingsStore";
import { useUserStore } from "../../store/useUserStore";

function SettingsModal({ context, id }: ContextModalProps) {
  const { currentUser } = useUserStore();
  const {
    settings,
    getSettings,
    fetchUserSettings,
    updateUserSettings,
    updateSettings,
  } = useSettingsRepo();
  const { setColorScheme } = useMantineColorScheme({
    keepTransitions: true,
  });

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
      onClose: () => handleSave(),
    });

    if (currentUser?.id) {
      fetchUserSettings(currentUser.id);
    }
  }, []);

  const handleSave = async () => {
    if (!currentUser?.id || !settings) return;

    await updateUserSettings(currentUser.id, getSettings()!);
    closeModal(id);
  };

  const handleThemeChange = (value: string) => {
    // Update theme immediately
    const theme = value as IUserSettings["theme"];
    updateSettings("theme", theme);
    setColorScheme(theme.toLowerCase() as MantineColorScheme);
  };

  const handleCanvasChange = (value: string) => {
    // Update canvas background immediately
    updateSettings("canvasBackground", value as BackgroundVariant);
  };

  const handleAutoSaveChange = (value: string | number) => {
    // Update auto save interval immediately
    updateSettings("autoSaveInterval", Number(value));
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
                onChange={handleAutoSaveChange}
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
                onChange={handleThemeChange}
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
                onChange={handleCanvasChange}
              />
            </Flex>
          </Flex>
        </Tabs.Panel>
      </Tabs>

      {/* <Flex justify="flex-end" mt="md">
        <Button onClick={handleSave} variant="filled">
          Save
        </Button>
      </Flex> */}
    </>
  );
}

export default SettingsModal;
