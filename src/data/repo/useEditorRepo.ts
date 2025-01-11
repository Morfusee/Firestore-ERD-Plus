import { Connection, Edge, XYPosition } from "@xyflow/react";
import { useEditorStore } from "../../store/useEditorStore";
import {
  EditorNode,
  TableField,
} from "../../types/EditorTypes";
import { nanoid } from "nanoid";
import {
  IEditorDataSnapshot,
  NodeDataBase,
} from "../../types/EditorStoreTypes";
import { useDebouncedCallback } from "@mantine/hooks";

const useEditorRepo = () => {
  
  const addNodeState = useEditorStore((state) => state.addNode);
  const moveNodeState = useEditorStore((state) => state.moveNode);
  const deleteNodeState = useEditorStore((state) => state.deleteNode);
  const editNodeDataState = useEditorStore((state) => state.editNodeData);
  const addNodeDataFieldState = useEditorStore(
    (state) => state.addNodeDataField
  );
  const editNodeDataFieldState = useEditorStore(
    (state) => state.editNodeDataField
  );
  const deleteNodeDataFieldState = useEditorStore(
    (state) => state.deleteNodeDataField
  );

  const addEdgeState = useEditorStore((state) => state.addEdge);
  const changeEdgeState = useEditorStore((state) => state.changeEdge);
  const deleteEdgeState = useEditorStore((state) => state.deleteEdge);

  const pushUndo = useEditorStore((state) => state.pushUndo);
  const clearRedo = useEditorStore((state) => state.clearRedo);

  const getDataSnap = useEditorStore((state) => state.getDataSnapshot);

  const setCanUndo = useEditorStore((state) => state.setCanUndo);
  const setCanRedo = useEditorStore((state) => state.setCanRedo);
  const getUndoStack = useEditorStore((state) => state.getUndoStack);

  const setHasPendingChanges = useEditorStore(
    (state) => state.setHasPendingChanges
  );

  const addNode = (type: EditorNode["type"], position?: XYPosition) => {
    // Define initial node data
    let data: EditorNode = {
      id: nanoid(),
      position: {
        x: position?.x || 0,
        y: position?.y || 0,
      },
      data: {},
    }

    switch(type) {
      case 'note': {
        data = {
          ...data,
          data: {
            note: "",
          },
          type: type,
        }
        break
      }
      case 'table': {
        data = {
          ...data,
          data: {
            name: "",
            type: "collection",
            fields: [],
          },
          type: type,
        }
        break
      }
    }

    // Run onChange
    onChange();
    // Add a node to state
    addNodeState(data);
  };

  const moveNode = (id: string, position: XYPosition) => {
    // Run onChange
    onChange();
    // Update node position in state
    moveNodeState(id, position);
  };

  const deleteNode = (id: string) => {
    // Run onChange
    onChange();
    // Delete node in state
    deleteNodeState(id);
  };

  const editNodeData = (id: string, change: NodeDataBase) => {
    // Run onChange
    onChange();
    // Check if name is valid
    // Change node data in state
    editNodeDataState(id, change);
  };

  const addNodeDataField = (id: string) => {
    // Define initial data node
    const data: TableField = {
      name: "field",
      type: "string",
    };

    // Run onChange
    onChange()
    // Add a field in node data state
    addNodeDataFieldState(id, data);
  };

  const editNodeDataField = (
    id: string,
    fieldIdx: number,
    field: Partial<TableField>
  ) => {
    // Run onChange
    onChange();
    // Edit field in node data state
    editNodeDataFieldState(id, fieldIdx, field);
  };

  const deleteNodeDataField = (id: string, fieldIdx: number) => {
    // Run onChange
    onChange();
    // Delete field in node data state
    deleteNodeDataFieldState(id, fieldIdx);
  };

  const addEdge = (conn: Connection) => {

    if (!conn.sourceHandle || !conn.targetHandle) return
    // Run onChange
    onChange();

    // Add edge
    addEdgeState(conn)
  };

  const changeEdge = (oldEdge: Edge, conn: Connection) => {
    if (!conn.sourceHandle || !conn.targetHandle) return

    // Check if reconnected on same handle
    if (oldEdge.targetHandle === conn.targetHandle) return

    // Run onChange
    onChange();    

    // Change edge source/target
    changeEdgeState(oldEdge, conn)
  };

  const deleteEdge = (id: string) => {
    // Run onChange
    onChange();
    // Delete edge
    deleteEdgeState(id)
  };


  const onChange = () => {
    const data = getDataSnap();
    handleHistory(data);
    debounceHasPendingChanges();
  };

  // Handles undo/redo stack and canUndo/canRedo states
  // NOTE: Don't export this function
  const handleHistory = (data: IEditorDataSnapshot) => {
    pushUndo(data);
    setCanUndo(getUndoStack().length !== 0);
    clearRedo();
    setCanRedo(false);
  };

  // Debounces the hasPendingChanges state to its original state
  // NOTE: Don't export this function
  const debounceHasPendingChanges = () => {
    setHasPendingChanges(true);
    debouncedCallbackHasPendingChanges();
  };

  const debouncedCallbackHasPendingChanges = useDebouncedCallback(() => {
    setHasPendingChanges(false);
  }, 1000);

  return {
    addNode,
    moveNode,
    deleteNode,
    editNodeData,
    addNodeDataField,
    editNodeDataField,
    deleteNodeDataField,
    addEdge,
    changeEdge,
    deleteEdge,
  };
};

export default useEditorRepo;