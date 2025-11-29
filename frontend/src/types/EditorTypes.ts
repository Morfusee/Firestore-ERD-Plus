import type { Node } from "@xyflow/react";

export type TableType = string;

export type FieldType = string;

export type TableField = {
  name: string;
  type: FieldType;
};

export type TableNodeData = {
  name: string;
  type: TableType;
  headerColor?: string;
  fields: TableField[];
};

export type NoteNodeData = {
  note?: string;
};

export type NoteNode = Node<NoteNodeData, "note">;

export type TableNode = Node<TableNodeData, "table">;

export type EditorNode = TableNode | NoteNode;
