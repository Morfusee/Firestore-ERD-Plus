import { Box, Loader, Paper, useMantineTheme } from "@mantine/core";
import "@xyflow/react/dist/style.css";
import TopMiddleBar from "../components/TopMiddleBar";
import TopLeftBar from "../components/TopLeftBar";
import BottomMiddleBar from "../components/BottomMiddleBar";
import useIsDarkMode from "../utils/useIsDarkMode";
import Editor from "./editor";
import { useDataInitializer } from "../data/repo/useDataInitializer";
import { ReactFlowProvider } from "@xyflow/react";
import { useBlocker, useParams } from "react-router-dom";
import useProjectRepo from "../data/repo/useProjectRepo";
import { useEditorStore } from "../store/useEditorStore";
import { useEffect } from "react";
import useHistoryRepo from "../data/repo/useHistoryRepo";

function FirestoreERD() {
  const theme = useMantineTheme();
  const isDarkMode = useIsDarkMode();
  const { isLoaded } = useDataInitializer();
  const { hasPendingChanges } = useEditorStore();

  // Invoke the useBlocker hook
  // This is a blocker for unsaved changes
  useBlocker(hasPendingChanges);

  // Show an alert if there are unsaved changes if the user tries to leave
  const handleBeforeUnload = async (event: any) => {
    const message = "Confirm refresh";

    // Standard for most browsers
    event.returnValue = message;

    // For older browsers (optional)
    return message;
  };

  // useEffect(() => {
  //   // Set up the beforeunload event listener
  //   window.addEventListener("beforeunload", handleBeforeUnload);

  //   // Cleanup the event listener on component unmount
  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //   };
  // }, []);

  return (
    <Paper
      className="w-screen h-screen relative"
      bg={!isDarkMode ? theme.colors.gray[2] : theme.colors.dark[8]}
    >
      {isLoaded ? (
        <>
          <TopLeftBar />
          <TopMiddleBar />
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
