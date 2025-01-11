import {
  Combobox,
  InputBase,
  Input,
  Flex,
  Tabs,
  Text,
  ComboboxStore,
  rem,
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
import { EmojiData, EmojiGroup } from "../types/EmojiData";
import useIsDarkMode from "../utils/useIsDarkMode";
import { useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import DeferredRender from "./DeferredRender";

interface IComboboxOption {
  icon: React.ForwardRefExoticComponent<
    IconProps & React.RefAttributes<Icon>
  > | null;
  value: string;
}

function EmojiPicker({
  combobox,
  comboboxValue,
  comboboxOnOptionSubmit,
  optionList,
}: {
  combobox: ComboboxStore;
  comboboxValue: string;
  comboboxOnOptionSubmit: (value: string) => void;
  optionList: EmojiGroup;
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
      <EmojiPickerDropdown options={optionList}></EmojiPickerDropdown>
    </Combobox>
  );
}

function EmojiPickerDropdown({ options }: { options: EmojiGroup }) {
  return (
    <Combobox.Dropdown>
      <Combobox.Options>
        <EmojiPickerTabs>
          {(group) =>
            options[group].map((option, index) => (
              <DeferredRender idleTimeout={100} key={index}>
                <Combobox.Option value={option.emoji}>
                  <EmojiPickerOptionContent optionValue={option.emoji} />
                </Combobox.Option>
              </DeferredRender>
            ))
          }
        </EmojiPickerTabs>
      </Combobox.Options>
    </Combobox.Dropdown>
  );
}

interface ITabData {
  value: string;
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
  group: (keyof EmojiGroup)[];
}

function EmojiPickerTabs({
  children,
}: {
  children: (group: keyof EmojiGroup) => React.ReactNode;
}) {
  const isDarkMode = useIsDarkMode();
  const tabData: ITabData[] = useMemo(
    () => [
      {
        value: "faces",
        icon: IconMoodSmile,
        group: ["smileysEmotion", "peopleBody", "component"],
      },
      {
        value: "animals",
        icon: IconDog,
        group: ["animalsNature"],
      },
      {
        value: "activities",
        icon: IconBubbleTea2,
        group: ["foodDrink", "activities"],
      },
      {
        value: "places",
        icon: IconWorld,
        group: ["travelPlaces"],
      },
      {
        value: "objects",
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
      <Tabs.List>
        {tabData.map((tab) => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            leftSection={<tab.icon size={"1rem"} />}
          />
        ))}
      </Tabs.List>

      {tabData.map((tab) => (
        <Tabs.Panel
          value={tab.value}
          key={tab.value}
          className="flex gap-1 py-1 flex-wrap overflow-y-auto max-h-48 beautifulScrollBar"
        >
          {tab.group.map((group) => (
            <React.Fragment key={group}>{children(group)}</React.Fragment>
          ))}
        </Tabs.Panel>
      ))}
    </Tabs>
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

export default EmojiPicker;
