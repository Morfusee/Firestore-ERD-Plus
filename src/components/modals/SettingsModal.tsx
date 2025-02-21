import {
  Modal,
  Flex,
  Button,
  Text,
  Tabs,
  SegmentedControl,
  rem,
  ThemeIcon,
  useMantineColorScheme,
  MantineColorScheme,
  NumberInput,
  Divider,
} from "@mantine/core";
import { ContextModalProps, closeModal } from "@mantine/modals";
import { useEffect } from "react";
import useIsDarkMode from "../../hooks/useIsDarkMode";
import {
  IconPhoto,
  IconMessageCircle,
  IconSettings,
  IconEye,
  IconAdjustmentsAlt,
  IconBuilding,
} from "@tabler/icons-react";
import { usePartialUserSettingsStore } from "../../store/globalStore";
import { BackgroundVariant } from "@xyflow/react";

function SettingsModal({ context, id, innerProps }: ContextModalProps) {
  const isDarkMode = useIsDarkMode();
  const {
    canvasBackground,
    setCanvasBackground,
    autoSaveInterval,
    setAutoSaveInterval,
  } = usePartialUserSettingsStore();
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
    });
  }, []);

  const isSelected = false;

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
                defaultValue={autoSaveInterval}
                onChange={(e) => setAutoSaveInterval(Number(e))}
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
                defaultValue={isDarkMode ? "Dark" : "Light"}
                onChange={(e) =>
                  setColorScheme(e.toLowerCase() as MantineColorScheme)
                }
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
                defaultValue={
                  canvasBackground[0].toUpperCase() + canvasBackground.slice(1)
                }
                onChange={(e) =>
                  setCanvasBackground(e.toLowerCase() as BackgroundVariant)
                }
              />
            </Flex>
          </Flex>
        </Tabs.Panel>
      </Tabs>
    </>
  );
}

export default SettingsModal;
