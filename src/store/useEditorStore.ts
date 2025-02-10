import { create } from "zustand";
import { IEditorState, IEditorActions } from "../types/EditorStoreTypes";
import { devtools } from "zustand/middleware";
import { addEdge, reconnectEdge } from "@xyflow/react";
import { TableNode } from "../types/EditorTypes";


export const useEditorStore = create<IEditorState & IEditorActions>()(
  devtools(
    (set, get) => ({
      nodes: [],
      edges: [],
      undoStack: [],
      redoStack: [],
      canUndo: false,
      canRedo: false,
      historyCounter: 0,
      canSave: false,
      hasPendingChanges: false,

      getNodes: () => get().nodes,
      getEdges: () => get().edges,
      getNodesAndEdges: () => ({
        nodes: get().nodes,
        edges: get().edges,
      }),
      setNodes: (nodes) => set(() => ({ nodes: nodes })),
      addNode: (node) =>
        set((state) => {
          if (node.type === "table" && node.data.name === "") {
            const data: typeof node = {
              ...node,
              data: {
                ...node.data,
                name: `Table ${state.nodes.length + 1}`
              }
            }
            return { nodes: [...state.nodes, data] }
          } 
          return { nodes: [...state.nodes, node] }
        }),
      changeNode: (node) =>
        set((state) => ({
          nodes: state.nodes.map((item) => {
            if (node.id === item.id) {
              return node;
            } else {
              return item;
            }
          }),
        })),
      deleteNode: (id) =>
        set((state) => ({
          nodes: state.nodes.filter((item) => item.id !== id),
        })),
      moveNode: (id, position) =>
        set((state) => ({
          nodes: state.nodes.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                position: position,
              };
            } else {
              return item;
            }
          }),
        })),
      editNodeData: (id, payload) =>
        set((state) => ({
          nodes: state.nodes.map((item) => {
            if (item.id === id) {
              if (item.type === "table") {
                return {
                  ...item,
                  data: {
                    ...item.data,
                    ...payload,
                  },
                };
              } else if (item.type === "note") {
                return {
                  ...item,
                  data: {
                    ...item.data,
                    ...payload,
                  },
                };
              } else {
                return item;
              }
            } else {
              return item;
            }
          }),
        })),
      addNodeDataField: (id, field) =>
        set((state) => {
          console.log("addNodeDataField", id, field, state.nodes);
          return {
            nodes: state.nodes.map((item) => {
              if (item.id === id) {
                if (item.type === "table") {
                  return {
                    ...item,
                    data: {
                      ...item.data,
                      fields: [...item.data.fields, field],
                    },
                  };
                } else {
                  return item;
                }
              } else {
                return item;
              }
            }),
          };
        }),
      editNodeDataField: (id, fieldIdx, fieldChanges) =>
        set((state) => ({
          nodes: state.nodes.map((item) => {
            if (item.id === id) {
              if (item.type === "table") {
                return {
                  ...item,
                  data: {
                    ...item.data,
                    fields: item.data.fields.map((fieldItem, idx) => {
                      if (fieldIdx === idx) {
                        return {
                          ...fieldItem,
                          ...fieldChanges
                        };
                      } else {
                        return fieldItem;
                      }
                    }),
                  },
                };
              } else {
                return item;
              }
            } else {
              return item;
            }
          }),
        })),
      deleteNodeDataField: (id, fieldIdx) =>
        set((state) => ({
          nodes: state.nodes.map((item) => {
            if (item.id === id) {
              if (item.type === "table") {
                return {
                  ...item,
                  data: {
                    ...item.data,
                    fields: item.data.fields.filter((_, idx) => fieldIdx !== idx),
                  },
                };
              } else {
                return item;
              }
            } else {
              return item;
            }
          }),
        })),

      addEdge: (conn) =>
        set((state) => ({
          edges: addEdge(conn, state.edges)
        })),
      changeEdge: (oldEdge, newConn) =>
        set((state) => ({
          edges: reconnectEdge(oldEdge, newConn, state.edges)
        })),
      deleteEdge: (id) => 
        set((state) => ({
          edges: state.edges.filter(edge => edge.id !== id)
        })),
  
      pushUndo: (history) =>
        set((state) => ({
          undoStack: [history, ...state.undoStack],
        })),
      popUndo: () => {
        const stack = get().undoStack
        set(() => ({ undoStack: stack.slice(1) }))
        return stack[0]
      },
      clearUndo: () => set(() => ({ undoStack: [] })),
      setCanUndo: (bool) => set(() => ({ canUndo: bool })),
      getUndoStack: () => get().undoStack,
      pushRedo: (history) =>
        set((state) => ({
          redoStack: [history, ...state.redoStack],
        })),
      popRedo: () => {
        const stack = get().redoStack
        set(() => ({ redoStack: stack.slice(1) }))
        return stack[0]
      },
      clearRedo: () => set(() => ({ redoStack: [] })),
      setCanRedo: (bool) => set(() => ({ canRedo: bool })),
      getRedoStack: () => get().redoStack,

      incHistoryCounter: () =>
        set((state) => ({ historyCounter: state.historyCounter + 1 })),
      decHistoryCounter: () =>
        set((state) => ({ historyCounter: state.historyCounter - 1 })),
      resetHistoryCounter: () => set(() => ({ historyCounter: 0 })),
      setCanSave: (bool) => set({ canSave: bool }),
      setHasPendingChanges: (bool) => set({ hasPendingChanges: bool }),

      getStateSnapshot: () => {
        const {
          nodes,
          edges,
          undoStack,
          redoStack,
          canUndo,
          canRedo,
          historyCounter,
          canSave,
        } = get();
        return {
          nodes,
          edges,
          undoStack,
          redoStack,
          canUndo,
          canRedo,
          historyCounter,
          canSave,
        };
      },
      loadStateSnapshot: (snapshot) => set(() => snapshot),
      clearStateSnapshot: () => set({
        nodes: [],
        edges: [],
        undoStack: [],
        redoStack: [],
        canUndo: false,
        canRedo: false,
        historyCounter: 0,
        canSave: false,
        hasPendingChanges: false,
      }),
      getDataSnapshot: () => {
        const { nodes, edges } = get();
        return { nodes, edges };
      },
      loadDataSnapshot: (snapshot) => set(() => snapshot),
    }),
    {
      name: "editorStore",
    }
  )
);
