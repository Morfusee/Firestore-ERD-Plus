import { Handle, NodeProps, NodeResizer, Position } from "@xyflow/react";
import type {
  TableType,
  TableField,
  TableNode,
} from "../../../types/EditorTypes";
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
import TextSelect from "../../../components/TextSelect";
import { ChangeEvent, memo, useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import useIsDarkMode from "../../../utils/useIsDarkMode";
import useEditorRepo from "../../../data/repo/useEditorRepo";
import { useDidUpdate, useThrottledCallback } from "@mantine/hooks";

export default memo(({ id, data, isConnectable }: NodeProps<TableNode>) => {
  const theme = useMantineTheme();
  const isDarkMode = useIsDarkMode();
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

  const { editNodeData, addNodeDataField, editNodeDataField } = useEditorRepo();

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
      <Card className="min-w-[250px] min-h-[250px] w-full h-full">
        <Card.Section
          className="px-4 py-2"
          styles={{
            section: {
              backgroundColor: backgroundColor,
            },
          }}
        >
          <TableNodeField
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
                <TextSelect 
                  value={"auto-gen"} 
                  options={idOptions} 
                />
              </Flex>
              {data.fields.map((field, index) => (
                <TableNodeField
                  key={index}
                  field={field}
                  fieldOptions={fieldOptions}
                  onFieldNameChange={(val) => editNodeDataField(id, index, { name: val })}
                  onFieldTypeChange={(val) => editNodeDataField(id, index, { type: val })}
                  placeholder="field name"
                />
              ))}
            </Stack>
            <Button
              className="flex justify-center"
              variant="default"
              rightSection={<IconPlus size={18} />}
              onClick={() => addNodeDataField(id)}
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
  field,
  fieldOptions,
  placeholder,
  onFieldNameChange,
  onFieldTypeChange,
}: {
  field: TableField | { name: TableField["name"]; type: TableType };
  fieldOptions: string[];
  placeholder?: string
  onFieldNameChange: (val: string) => void
  onFieldTypeChange: (val: string) => void
}) {
  const [fieldName, setFieldName] = useState(field.name)
  const [fieldType, setFieldType] = useState<string>(field.type)

  useDidUpdate(() => {
    if (field.name !== fieldName) {
      setFieldName(field.name || "")
    }
    if (field.type !== fieldType) {
      setFieldType(field.type || "")
    }
  }, [field])
  

  const debouncedFieldName = useThrottledCallback(
    (val: string) => {
      onFieldNameChange(val)
    },
    1000
  )

  const handleFieldNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFieldName(e.target.value)
    debouncedFieldName(e.target.value)
  }

  const handleFieldTypeChange = (val: string) => {
    setFieldType(val)
    onFieldTypeChange(val)
  }

  return (
    <Flex
      justify="space-between"
      gap={"xs"}
      className={
        "px-2 py-1 rounded-md transition-colors " 
        // + (!isOfNodeType(field.type) &&
        //   (isDarkMode ? "hover:bg-neutral-700" : "hover:bg-neutral-300"))
      }
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
        className="w-full"
      />
      <TextSelect value={fieldType} options={fieldOptions} onChange={handleFieldTypeChange} />
    </Flex>
  );
}
