import { useEffect } from "react";
import { useEditorStore } from "../../store/useEditorStore";
import { useProjectStore } from "../../store/useProjectStore";
import { db } from "../db/db";

const useHistoryRepo = () => {
  const selectedProject = useProjectStore((state) => state.selectedProject);
  const editProjectState = useProjectStore((state) => state.editProject);

  const currentStep = useEditorStore((state) => state.getNodesAndEdges);

  const canUndo = useEditorStore((state) => state.canUndo);
  const setCanUndo = useEditorStore((state) => state.setCanUndo);
  const getUndoStack = useEditorStore((state) => state.getUndoStack);
  const canRedo = useEditorStore((state) => state.canRedo);
  const setCanRedo = useEditorStore((state) => state.setCanRedo);
  const getRedoStack = useEditorStore((state) => state.getRedoStack);

  const editCounter = useEditorStore((state) => state.historyCounter);
  const incCounter = useEditorStore((state) => state.incHistoryCounter);
  const decCounter = useEditorStore((state) => state.decHistoryCounter);
  const resetCounter = useEditorStore((state) => state.resetHistoryCounter);
  const canSave = useEditorStore((state) => state.canSave);
  const setCanSave = useEditorStore((state) => state.setCanSave);

  const pushRedo = useEditorStore((state) => state.pushRedo);
  const popRedo = useEditorStore((state) => state.popRedo)
  const pushUndo = useEditorStore((state) => state.pushUndo);
  const popUndo = useEditorStore((state) => state.popUndo)

  useEffect(() => {
    setCanSave(editCounter != 0);
  }, [editCounter]);

  const getDataSnap = useEditorStore((state) => state.getDataSnapshot);
  const loadDataSnapshot = useEditorStore((state) => state.loadDataSnapshot);


  const onUndo = () => {
    // Check if the user can undo
    if (!canUndo) return;

    // Pop the undo and get the returned history
    const history = popUndo()

    // Push the current step to the redo stack
    // since it is not being tracked by the undo stack
    pushRedo(currentStep());

    // Load the snapshot of the first item
    loadDataSnapshot(history);


    // Update the canUndo state
    setCanUndo(getUndoStack().length !== 0);

    // Also update the canRedo state
    setCanRedo(getRedoStack().length !== 0);

    // Decrease history counter
    decCounter();
  };

  const onRedo = () => {
    // Check if the user can redo
    if (!canRedo) return;

    // Shift the redo stack
    const history = popRedo()

    // Push the current step to the redo stack
    // since it is not being tracked by the redo stack
    pushUndo(currentStep());

    // Load the snapshot of the first item
    loadDataSnapshot(history);


    // Update the canRedo state
    setCanRedo(getRedoStack().length !== 0);

    // Also update the canUndo state
    setCanUndo(getUndoStack().length !== 0);

    // Increase history counter
    incCounter();
  };

  const onSave = async () => {
    if (!selectedProject) return;
    if (!selectedProject.id) return;

    const snapshot = getDataSnap();
    const json = JSON.stringify(snapshot);

    const timestamp = Date.now();
    const data = {
      diagramData: json,
      updatedAt: timestamp,
    };

    // Save to db
    await db.projects.update(selectedProject.id, data);
    // Save to state
    editProjectState(selectedProject.id, data);
    resetCounter();
  };

  return {
    canUndo,
    onUndo,
    canRedo,
    onRedo,
    canSave,
    onSave,
    currentStep,
  };
};

export default useHistoryRepo;