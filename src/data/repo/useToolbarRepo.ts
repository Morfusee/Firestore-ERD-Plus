import { ToolbarOptions, useToolbarStore } from "../../store/useToolbarStore";


const useToolbarRepo = () => {
  const setCurrentTool = useToolbarStore((state) => state.setCurrentTool);

  const changeTool = (tool: ToolbarOptions) => {
    setCurrentTool(tool)
  }

  const resetTool = () => {
    setCurrentTool("select")
  }

  const onTableClick = () => {
    
  }

  return {
    changeTool,
    resetTool
  }
}


export default useToolbarRepo