import { Box, Loader, Paper, useMantineTheme } from "@mantine/core";
import "@xyflow/react/dist/style.css";
import { useDataInitializer } from "../data/repo/useDataInitializer";
import useIsDarkMode from "../hooks/useIsDarkMode";
import BottomMiddleBar from "../layouts/BottomMiddleBar";
import TopLeftBar from "../layouts/TopLeftBar";
import TopMiddleBar from "../layouts/TopMiddleBar";
import TopRightBar from "../layouts/TopRightBar";
import Editor from "./editor";

function FirestoreERD() {
  const theme = useMantineTheme();
  const isDarkMode = useIsDarkMode();
  const { isLoaded } = useDataInitializer();

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
