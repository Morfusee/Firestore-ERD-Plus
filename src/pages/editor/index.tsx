import { Box, useMantineTheme } from "@mantine/core";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  Edge,
  NodeTypes,
  OnConnect,
  OnNodeDrag,
  OnReconnect,
  ProOptions,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
import { EditorNode } from "../../types/EditorTypes";
import TableNode from "./nodes/TableNode";

import "@xyflow/react/dist/style.css";
import useIsDarkMode from "../../hooks/useIsDarkMode";
import { useCallback, useMemo, useRef } from "react";
import useEditorRepo from "../../data/repo/useEditorRepo";
import { useEditorStore } from "../../store/useEditorStore";
import NoteNode from "./nodes/NoteNode";
import { usePartialUserSettingsStore } from "../../store/globalStore";

function Editor() {
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      table: TableNode,
      note: NoteNode,
    }),
    []
  );

  const proOptions: ProOptions = {
    hideAttribution: true,
  };

  const theme = useMantineTheme();
  const isDarkMode = useIsDarkMode();
  const { canvasBackground } = usePartialUserSettingsStore();
  const { screenToFlowPosition } = useReactFlow()

  const nodes = useEditorStore((state) => state.nodes);
  const edges = useEditorStore((state) => state.edges);

  const onNodeDrag: OnNodeDrag<EditorNode> = useCallback(
    (_, node) => moveNode(node.id, node.position),
    []
  );

  const onConnect: OnConnect = useCallback((conn) => addEdge(conn), []);
  const edgeReconnectSuccessful = useRef(true);

  const onReconnect: OnReconnect = useCallback((oldEdge, newConn) => {
    edgeReconnectSuccessful.current = true;
    changeEdge(oldEdge, newConn);
  }, []);

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnectEnd = useCallback(
    (_: MouseEvent | TouchEvent, edge: Edge) => {
      if (!edgeReconnectSuccessful.current) {
        deleteEdge(edge.id);
      }

      edgeReconnectSuccessful.current = true;
    },
    []
  );

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      console.log(position)
    }, []
  )

  const { moveNode, addEdge, changeEdge, deleteEdge } = useEditorRepo();

  return (
    <Box className="w-full h-full">
      <ReactFlow
        colorMode={isDarkMode ? "dark" : "light"}
        //panOnDrag={[2]}
        nodeTypes={nodeTypes}
        defaultNodes={nodes}
        defaultEdges={edges}
        nodes={nodes}
        edges={edges}
        onNodeDragStop={onNodeDrag}
        onConnect={onConnect}
        onReconnect={onReconnect}
        onReconnectStart={onReconnectStart}
        onReconnectEnd={onReconnectEnd}
        onPaneClick={onPaneClick}
        proOptions={proOptions}
        connectionMode={ConnectionMode.Loose}
        className="-z-10"
      >
        <Background
          color={!isDarkMode ? theme.colors.dark[9] : theme.colors.dark[4]}
          variant={canvasBackground}
          gap={40}
        />
        <Controls />
      </ReactFlow>
    </Box>
  );
}

export default Editor;
