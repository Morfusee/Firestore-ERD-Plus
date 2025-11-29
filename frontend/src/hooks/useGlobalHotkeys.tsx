import { useHotkeys } from "@mantine/hooks";
import useHistoryRepo from "../data/repo/useHistoryRepo";

export default function useGlobalHotkeys() {
  const { onUndo, onRedo } = useHistoryRepo();
  
  return useHotkeys([
    ["ctrl+z", onUndo],
    ["ctrl+shift+z", onRedo],
    ["ctrl+y", onRedo],
  ]);
}
