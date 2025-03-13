import {
  Button,
  Card,
  Flex,
  rem,
  Stack,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useDidUpdate } from "@mantine/hooks";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Handle, NodeProps, NodeResizer, Position } from "@xyflow/react";
import { useContextMenu } from "mantine-contextmenu";
import { ChangeEvent, memo, useCallback, useEffect, useState } from "react";
import TextSelect from "../../../components/ui/TextSelect";
import useEditorRepo from "../../../data/repo/useEditorRepo";
import useIsDarkMode from "../../../hooks/useIsDarkMode";
import type {
  TableField,
  TableNode,
  TableType,
} from "../../../types/EditorTypes";
import _ from "lodash";

export default memo(({ id, data, isConnectable }: NodeProps<TableNode>) => {
  const theme = useMantineTheme();
  const isDarkMode = useIsDarkMode();
  const { showContextMenu } = useContextMenu();
  const tableOptions = ["collection", "subcollection", "document"];

  const idOptions = ["auto-gen", "string", "number"];

  const fieldOptions = [
    "string",
    "number",
    "boolean",
    "map",
    "array",
    "null",
    "timestamp",
    "geopoint",
    "reference",
  ];

  const backgroundColor = isDarkMode
    ? theme.colors.dark[7]
    : theme.colors.gray[2];

  const {
    deleteNode,
    editNodeData,
    addNodeDataField,
    editNodeDataField,
    deleteNodeDataField,
  } = useEditorRepo();

  return (
    <>
      <NodeResizer
        lineStyle={{
          opacity: 0,
        }}
        handleStyle={{
          opacity: 0,
        }}
        minWidth={250}
        minHeight={250}
      />
      <Card
        className="min-w-[250px] min-h-[250px] w-full h-full"
        onContextMenu={showContextMenu([
          // {
          //   key: 'duplicateTable',
          //   title: 'Duplicate Table',
          //   icon: <IconCopyPlus size={16}/>,
          //   onClick: () => {}
          // },
          {
            key: "deleteTable",
            title: "Delete Table",
            color: "red",
            icon: <IconTrash size={16} />,
            onClick: () => deleteNode(id),
          },
        ])}
      >
        <Card.Section
          className="px-4 py-2"
          styles={{
            section: {
              backgroundColor: backgroundColor,
            },
          }}
        >
          <TableNodeField
            type="title"
            field={{ name: data.name, type: data.type }}
            fieldOptions={tableOptions}
            onFieldNameChange={(val) => editNodeData(id, { name: val })}
            onFieldTypeChange={(val) => editNodeData(id, { type: val })}
            placeholder="Table Name"
          />
        </Card.Section>

        <Card.Section>
          <Stack className="px-3 py-2" gap="xs">
            <Stack gap={2}>
              <Flex justify="space-between" className="px-2 py-2 rounded-md ">
                <Text>id</Text>
                <TextSelect value={"auto-gen"} options={idOptions} />
              </Flex>
              {data.fields.map((field, index) => (
                <TableNodeField
                  key={index}
                  type="field"
                  field={field}
                  fieldOptions={fieldOptions}
                  onFieldNameChange={(val) =>
                    editNodeDataField(id, index, { name: val })
                  }
                  onFieldTypeChange={(val) =>
                    editNodeDataField(id, index, { type: val })
                  }
                  placeholder="field name"
                  onContextMenu={showContextMenu([
                    {
                      key: "deleteField",
                      title: "Delete Field",
                      color: "red",
                      icon: <IconTrash size={16} />,
                      onClick: () => deleteNodeDataField(id, index),
                    },
                  ])}
                />
              ))}
            </Stack>
            <Button
              className="flex justify-center"
              variant="default"
              rightSection={<IconPlus size={18} />}
              onClick={() => {
                console.log("The id added", id);
                addNodeDataField(id);
              }}
            >
              Add Field
            </Button>
          </Stack>
        </Card.Section>
      </Card>

      <Handle
        type="source"
        id={`${id}-t`}
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        id={`${id}-l`}
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        id={`${id}-b`}
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        id={`${id}-r`}
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </>
  );
});

function TableNodeField({
  type,
  field,
  fieldOptions,
  placeholder,
  activeHover = false,
  onFieldNameChange,
  onFieldTypeChange,
  onContextMenu,
}: {
  type: "title" | "field";
  field: TableField | { name: TableField["name"]; type: TableType };
  fieldOptions: string[];
  placeholder?: string;
  activeHover?: boolean;
  onFieldNameChange: (val: string) => void;
  onFieldTypeChange: (val: string) => void;
  onContextMenu?: React.MouseEventHandler<HTMLDivElement> | undefined;
}) {
  const [fieldName, setFieldName] = useState(field.name);
  const [fieldType, setFieldType] = useState<string>(field.type);

  useDidUpdate(() => {
    if (field.name !== fieldName) {
      setFieldName(field.name || "");
    }
    if (field.type !== fieldType) {
      setFieldType(field.type || "");
    }
  }, [field]);

  /**
   * Memoized throttler for setting field name
   *
   * NOTES:
   * Don't provide a dependency if not necessary,
   * this causes the throttler to run on each change.
   */
  const throttledFieldName = useCallback(
    _.throttle(
      (val: string) => {
        onFieldNameChange(val);
      },
      1000,
      { leading: true, trailing: true }
    ),
    []
  );

  /**
   * Cleanup throttle on unmount
   * 
   * FIX:
   * Fixes the problem of pending/throttled changes to
   * transfer over to the next project.
   */
  useEffect(() => {
    return () => throttledFieldName.cancel();
  }, [throttledFieldName]);

  // Handle field name change
  const handleFieldNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFieldName(value);
    throttledFieldName(value);
  };

  // Handle field type change
  const handleFieldTypeChange = (val: string) => {
    setFieldType(val);
    onFieldTypeChange(val);
  };

  return (
    <Flex
      justify="space-between"
      gap={"xs"}
      className={
        "px-2 py-1 rounded-md transition-colors " +
        (!fieldName.trim() && "text-red-500 ") +
        (type === "field" && "hover:bg-neutral-500 hover:bg-opacity-20")
      }
      onContextMenu={onContextMenu}
    >
      <TextInput
        styles={{
          input: {
            fontSize: rem(16),
          },
        }}
        autoFocus
        variant="unstyled"
        placeholder={placeholder}
        value={fieldName}
        onChange={handleFieldNameChange}
        className="w-1/2"
      />
      <TextSelect
        value={fieldType}
        options={fieldOptions}
        onChange={handleFieldTypeChange}
      />
    </Flex>
  );
}
