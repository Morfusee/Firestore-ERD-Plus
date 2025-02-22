import {
  Menu,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

type TextSelectProps = {
  value: string;
  defaultValue?: string;
  options: string[];
  onChange?: (val: string) => void;
};

function TextSelect({
  value,
  defaultValue,
  options,
  onChange,
}: TextSelectProps) {
  const optionsRender = options.map((item) => (
    <Menu.Item 
      key={item} 
      onClick={()=> {
        if(onChange) {
          onChange(item)
        }
      }}
    >
      {item}
    </Menu.Item>
  ));

  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Menu
        opened={opened}
        onClose={close}
        clickOutsideEvents={["click", "mousedown", "pointerdown"]}
      >
        <Menu.Target>
          <UnstyledButton onClick={open}>{defaultValue || value}</UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>{optionsRender}</Menu.Dropdown>
      </Menu>
    </>
  );
}

export default TextSelect;
