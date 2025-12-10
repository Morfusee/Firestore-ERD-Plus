import useUserSettings from "@/hooks/useUserSettings";
import {
  CanvasBackgroundOptions,
  SettingsResponseDto,
  ThemeOptions,
} from "@/integrations/api/generated";
import {
  getApiSettingsOptions,
  putApiSettingsMutation,
} from "@/integrations/api/generated/@tanstack/react-query.gen";
import { useFirebaseAuth } from "@/integrations/firebase/firebase-auth-provider";
import {
  Divider,
  Flex,
  MantineColorScheme,
  NumberInput,
  SegmentedControl,
  Tabs,
  Text,
  rem,
  useMantineColorScheme,
} from "@mantine/core";
import { ContextModalProps, closeModal } from "@mantine/modals";
import { IconBuilding, IconEye } from "@tabler/icons-react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";

function SettingsModelQueryProvider({
  children,
}: {
  children: (props: {
    settings: SettingsResponseDto | undefined;
  }) => React.ReactNode;
}) {
  const { user } = useFirebaseAuth();

  const { data } = useSuspenseQuery({
    ...getApiSettingsOptions({
      query: {
        Email: user?.email || "",
      },
    }),
  });

  const settings = data?.data;

  return <>{children({ settings })}</>;
}

function SettingsModal({ context, id }: ContextModalProps) {
  const { user } = useFirebaseAuth();
  const { setColorScheme } = useMantineColorScheme({
    keepTransitions: true,
  });

  const { settings, setSettings } = useUserSettings();

  const { mutateAsync: updateUserSettingsMutate } = useMutation(
    putApiSettingsMutation()
  );

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
  }, [settings]);

  const handleSave = async () => {
    if (!user) return;

    await updateUserSettingsMutate({
      body: {
        email: user.email || "",
        ...settings,
      },
    });
    closeModal(id);
  };

  const handleThemeChange = (value: string) => {
    setSettings("theme", value as ThemeOptions);
    setColorScheme(value.toLowerCase() as MantineColorScheme);
  };

  const handleCanvasChange = (value: string) => {
    // Update canvas background immediately
    setSettings("canvasBackground", value as CanvasBackgroundOptions);
  };

  const handleAutoSaveChange = (value: string | number) => {
    setSettings("autoSaveInterval", Number(value));
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
              <SettingsModelQueryProvider>
                {({ settings }) => (
                  <NumberInput
                    placeholder="Interval in seconds"
                    allowNegative={false}
                    allowDecimal={false}
                    value={settings?.autoSaveInterval ?? 0}
                    onChange={handleAutoSaveChange}
                  />
                )}
              </SettingsModelQueryProvider>
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
              <SettingsModelQueryProvider>
                {({ settings }) => (
                  <SegmentedControl
                    size="xs"
                    data={["Light", "Dark"]}
                    value={settings?.theme ?? "Light"}
                    onChange={handleThemeChange}
                  />
                )}
              </SettingsModelQueryProvider>
            </Flex>
            <Flex direction={"column"} gap={"xs"}>
              <Flex direction={"column"}>
                <Text fw={500}>Canvas Background</Text>
                <Text opacity={"70%"} size="xs">
                  Select a background pattern for your canvas.
                </Text>
              </Flex>
              <SettingsModelQueryProvider>
                {({ settings }) => (
                  <SegmentedControl
                    size="xs"
                    data={["Dots", "Lines", "Cross"]}
                    value={settings?.canvasBackground}
                    onChange={handleCanvasChange}
                  />
                )}
              </SettingsModelQueryProvider>
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
