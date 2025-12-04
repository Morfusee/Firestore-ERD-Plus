import { Box, Loader, Paper, useMantineTheme } from "@mantine/core";
import "@xyflow/react/dist/style.css";
import TopMiddleBar from "../layouts/TopMiddleBar";
import TopLeftBar from "../layouts/TopLeftBar";
import BottomMiddleBar from "../layouts/BottomMiddleBar";
import useIsDarkMode from "../hooks/useIsDarkMode";
import Editor from "./editor";
import { useDataInitializer } from "../data/repo/useDataInitializer";
import { ReactFlowProvider } from "@xyflow/react";
import { useBlocker, useParams } from "react-router-dom";
import useProjectRepo from "../data/repo/useProjectRepo";
import { useEditorStore } from "../store/useEditorStore";
import { useEffect } from "react";
import useHistoryRepo from "../data/repo/useHistoryRepo";
import TopRightBar from "../layouts/TopRightBar";

function FirestoreERD() {
  const theme = useMantineTheme();
  const isDarkMode = useIsDarkMode();
  const { isLoaded } = useDataInitializer();
  const { hasPendingChanges } = useEditorStore();

  // Invoke the useBlocker hook
  // This is a blocker for unsaved changes
  // This is causing logging out issues
  // useBlocker(hasPendingChanges);

  return (
    <Paper
      className="w-screen h-screen relative overflow-hidden"
      bg={!isDarkMode ? theme.colors.gray[2] : theme.colors.dark[8]}
    >
      {isLoaded ? (
        <>
          <TopLeftBar />
          <TopMiddleBar />
          <TopRightBar />
          <Editor />
          <BottomMiddleBar />
        </>
      ) : (
        <Box className="w-full h-full grid place-content-center">
          <Loader />
        </Box>
      )}
    </Paper>
  );
}

export default FirestoreERD;
