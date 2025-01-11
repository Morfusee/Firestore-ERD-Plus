import { Connection, Edge, XYPosition } from "@xyflow/react";
import {
  EditorNode,
  NoteNodeData,
  TableField,
  TableNodeData,
} from "./EditorTypes";

export type NodeState = EditorNode[];

export type EdgeState = Edge[];

export interface IHistoryStack {
  nodes: NodeState;
  edges: EdgeState;
}

export interface IEditorDataSnapshot {
  nodes: NodeState;
  edges: EdgeState;
}

export interface IEditorStateSnapshot
  extends Omit<IEditorState, "hasPendingChanges"> {}

export interface IEditorState {
  nodes: NodeState;
  edges: EdgeState;
  undoStack: IHistoryStack[];
  redoStack: IHistoryStack[];
  canUndo: boolean;
  canRedo: boolean;
  historyCounter: number;
  canSave: boolean;
  hasPendingChanges: boolean;
}

export type NodeDataBase =
  | Partial<Omit<TableNodeData, "fields">>
  | Partial<NoteNodeData>;

export interface IEditorActions {
  getNodes: () => NodeState;
  getEdges: () => EdgeState;
  getNodesAndEdges: () => IHistoryStack;
  setNodes: (nodes: NodeState) => void;
  addNode: (node: EditorNode) => void;
  changeNode: (node: EditorNode) => void;
  deleteNode: (id: string) => void;
  moveNode: (id: string, position: XYPosition) => void;
  editNodeData: (id: string, payload: NodeDataBase) => void;
  addNodeDataField: (id: string, field: TableField) => void;
  editNodeDataField: (id: string, fieldIdx: number, field: Partial<TableField>) => void;
  deleteNodeDataField: (id: string, fieldIdx: number) => void;

  addEdge: (conn: Connection) => void;
  changeEdge: (oldEdge: Edge, newConn: Connection) => void;
  deleteEdge: (id: string) => void;

  pushUndo: (history: IHistoryStack) => void;
  popUndo: () => IHistoryStack;
  clearUndo: () => void;
  setCanUndo: (bool: boolean) => void;
  getUndoStack: () => IHistoryStack[];
  pushRedo: (history: IHistoryStack) => void;
  popRedo: () => IHistoryStack;
  clearRedo: () => void;
  setCanRedo: (bool: boolean) => void;
  getRedoStack: () => IHistoryStack[];

  incHistoryCounter: () => void;
  decHistoryCounter: () => void;
  resetHistoryCounter: () => void;
  setCanSave: (bool: boolean) => void;
  setHasPendingChanges: (bool: boolean) => void;

  getStateSnapshot: () => IEditorStateSnapshot;
  loadStateSnapshot: (snapshot: IEditorStateSnapshot) => void;
  getDataSnapshot: () => IEditorDataSnapshot;
  loadDataSnapshot: (snapshot: IEditorDataSnapshot) => void;
}
