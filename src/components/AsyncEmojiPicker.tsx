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
} from "@mantine/core";
import {
  IconProps,
  Icon,
  IconMoodSmile,
  IconDog,
  IconBubbleTea2,
  IconWorld,
  IconHeart,
} from "@tabler/icons-react";
import { EmojiCategory, EmojiData, EmojiGroup } from "../types/EmojiData";
import useIsDarkMode from "../utils/useIsDarkMode";
import { useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import DeferredRender from "./DeferredRender";
import { useIsFirstRender } from "@mantine/hooks";
import useEmojiData from "../utils/useEmojiData";

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
  category: keyof EmojiCategory;
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
  group: (keyof EmojiGroup)[];
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
        category: "faces",
        icon: IconMoodSmile,
        group: ["smileysEmotion", "peopleBody", "component"],
      },
      {
        category: "nature",
        icon: IconDog,
        group: ["animalsNature"],
      },
      {
        category: "activities",
        icon: IconBubbleTea2,
        group: ["foodDrink", "activities"],
      },
      {
        category: "places",
        icon: IconWorld,
        group: ["travelPlaces"],
      },
      {
        category: "objects",
        icon: IconHeart,
        group: ["objects", "symbols"],
      },
    ],
    []
  );

  return (
    <Tabs
      keepMounted={false}
      defaultValue="faces"
      className="w-full"
      variant="default"
      color={isDarkMode ? "white" : "dark"}
    >
      <MantineThemeProvider theme={theme}>
        <Tabs.List>
          {tabData.map((tab) => (
            <Tabs.Tab
              key={tab.category}
              value={tab.category}
              leftSection={<tab.icon size={"1rem"} />}
            />
          ))}
        </Tabs.List>
      </MantineThemeProvider>

      {tabData.map((tab) => (
        <Tabs.Panel
          value={tab.category}
          key={tab.category}
          className="flex gap-1 py-1 flex-wrap overflow-y-auto min-h-48 max-h-48 beautifulScrollBar"
        >
          <EmojiPickerTabContent category={tab.category} />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}

function EmojiPickerTabContent({
  category,
}: {
  category: keyof EmojiCategory;
}) {
  const { emojiData, loading, error } = useEmojiData(category);

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
