import {
  Combobox,
  InputBase,
  Input,
  Flex,
  Tabs,
  Text,
  ComboboxStore,
  rem,
  Box,
  Loader,
  MantineThemeProvider,
  createTheme,
  TabsTab,
  useMantineTheme,
  ScrollArea,
} from "@mantine/core";
import {
  IconProps,
  Icon,
  IconMoodSmile,
  IconDog,
  IconBubbleTea2,
  IconWorld,
  IconHeart,
  IconUser,
  IconPlane,
  IconBulb,
  IconBallTennis,
  IconComponents,
} from "@tabler/icons-react";
import { EmojiAsyncGroup, EmojiData, EmojiGroup } from "../../types/EmojiData";
import useIsDarkMode from "../../hooks/useIsDarkMode";
import { useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import DeferredRender from "../utils/DeferredRender";
import { useIsFirstRender } from "@mantine/hooks";
import useEmojiData from "../../hooks/useEmojiData";

interface IComboboxOption {
  icon: React.ForwardRefExoticComponent<
    IconProps & React.RefAttributes<Icon>
  > | null;
  value: string;
}

function AsyncEmojiPicker({
  combobox,
  comboboxValue,
  comboboxOnOptionSubmit,
}: {
  combobox: ComboboxStore;
  comboboxValue: string;
  comboboxOnOptionSubmit: (value: string) => void;
}) {
  return (
    <Combobox
      store={combobox}
      onOptionSubmit={comboboxOnOptionSubmit}
      keepMounted={false}
    >
      <Combobox.Target>
        <InputBase
          label="Icon"
          classNames={{
            label: "mb-1",
          }}
          required
          onClick={() => combobox.toggleDropdown()}
          component="button"
          type="button"
          pointer
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
        >
          {comboboxValue ? (
            <EmojiPickerOptionContent optionValue={comboboxValue} />
          ) : (
            <Input.Placeholder>Pick an icon</Input.Placeholder>
          )}
        </InputBase>
      </Combobox.Target>
      <EmojiPickerDropdown />
    </Combobox>
  );
}

function EmojiPickerDropdown() {
  return (
    <Combobox.Dropdown>
      <Combobox.Options>
        <EmojiPickerTabs />
      </Combobox.Options>
    </Combobox.Dropdown>
  );
}

interface ITabData {
  group: keyof EmojiAsyncGroup;
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
}

function EmojiPickerTabs() {
  // Theming
  const isDarkMode = useIsDarkMode();
  const mantineTheme = useMantineTheme();

  // Custom theme
  const theme = useMemo(
    () =>
      createTheme({
        components: {
          TabsTab: TabsTab.extend({
            defaultProps: {
              color: isDarkMode
                ? mantineTheme.colors.dark[1]
                : mantineTheme.colors.dark[8],
            },
          }),
        },
      }),
    []
  );

  const tabData: ITabData[] = useMemo(
    () => [
      {
        group: "smileys-emotion",
        icon: IconMoodSmile,
      },
      {
        group: "people-body",
        icon: IconUser,
      },
      {
        group: "animals-nature",
        icon: IconDog,
      },
      {
        group: "food-drink",
        icon: IconBubbleTea2,
      },
      {
        group: "travel-places",
        icon: IconPlane,
      },
      {
        group: "objects",
        icon: IconBulb,
      },
      {
        group: "symbols",
        icon: IconHeart,
      },
      {
        group: "activities",
        icon: IconBallTennis,
      },
    ],
    []
  );

  return (
    <Tabs
      keepMounted={false}
      defaultValue="smileys-emotion"
      className="w-full"
      variant="default"
      color={isDarkMode ? "white" : "dark"}
    >
      <MantineThemeProvider theme={theme}>
        <Tabs.List
          style={{
            display: "flex",
            flexWrap: "nowrap",
            justifyContent: "space-evenly",
          }}
        >
          {tabData.map((tab) => (
            <Tabs.Tab
              maw={rem(44)}
              key={tab.group}
              value={tab.group}
              leftSection={<tab.icon size={"1.2rem"} />}
            />
          ))}
        </Tabs.List>
      </MantineThemeProvider>

      {tabData.map((tab) => (
        <Tabs.Panel
          value={tab.group}
          key={tab.group}
          className="flex gap-1 py-1 flex-wrap overflow-y-auto min-h-48 max-h-48 beautifulScrollBar"
        >
          <EmojiPickerTabContent group={tab.group} />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}

function EmojiPickerTabContent({ group }: { group: keyof EmojiAsyncGroup }) {
  const { emojiData, loading, error } = useEmojiData(group);

  if (loading) {
    return (
      <Box className="w-full min-h-full flex items-center justify-center ">
        <Loader size={"sm"} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="w-full min-h-full flex items-center justify-center ">
        <Text size="sm">{error}</Text>
      </Box>
    );
  }

  return (
    <>
      {emojiData.map((data, index) => (
        <Combobox.Option value={data.emoji} key={index}>
          <EmojiPickerOptionContent optionValue={data.emoji} />
        </Combobox.Option>
      ))}
    </>
  );
}

function EmojiPickerOptionContent({
  optionValue,
}: {
  optionValue: IComboboxOption["value"];
}) {
  return (
    <Flex direction={"row"} align={"center"} className="gap-2">
      <Text size="lg">{optionValue}</Text>
    </Flex>
  );
}

export default AsyncEmojiPicker;
