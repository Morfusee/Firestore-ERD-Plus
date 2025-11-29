import { create } from "zustand";
import { devtools } from "zustand/middleware";


export type ToolbarOptions = "select" | "table" | "note"

interface IToolbarState {
  currentTool: ToolbarOptions;
}

interface IToolbarActions {
  setCurrentTool: (option: ToolbarOptions) => void;
}


export const useToolbarStore = create<IToolbarState & IToolbarActions>()(
  devtools(
    (set) => ({
      currentTool: "select",

      setCurrentTool: (option) => set(() => ({ currentTool: option })),
    }),
    {
      name: "toolbarStore",
    }
  )
);
