import { Flex, Paper, rem, Textarea, Text } from "@mantine/core";
import { NodeProps, NodeResizer } from "@xyflow/react";
import { memo, useCallback, useEffect, useState } from "react";
import { NoteNode } from "../../../types/EditorTypes";
import { IconNote } from "@tabler/icons-react";
import useIsDarkMode from "../../../hooks/useIsDarkMode";
import useEditorRepo from "../../../data/repo/useEditorRepo";
import { useThrottledCallback, useDidUpdate } from "@mantine/hooks";
import _ from "lodash";

export default memo(({ id, data }: NodeProps<NoteNode>) => {
  const isDarkMode = useIsDarkMode();
  const { editNodeData } = useEditorRepo();
  const [note, setNote] = useState(data.note);

  useDidUpdate(() => {
    if (data.note !== note) {
      setNote(data.note || "");
    }
  }, [data.note]);

  // Throttled function with useCallback for stability
  const throttledHandleTextAreaChange = useCallback(
    _.throttle(
      (value: string) => {
        editNodeData(id, { note: value });
      },
      1000,
      { leading: true, trailing: true }
    ),
    [id, editNodeData]
  );

  /**
   * Cleanup function to cancel throttle on unmount
   * 
   * FIX:
   * Fixes the problem of pending/throttled changes to
   * transfer over to the next project.
   */
  useEffect(() => {
    return () => throttledHandleTextAreaChange.cancel();
  }, [throttledHandleTextAreaChange]);

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNote(value);
    throttledHandleTextAreaChange(value);
  };
  return (
    <>
      <NodeResizer
        lineStyle={{
          opacity: 0,
        }}
        handleStyle={{
          opacity: 0,
        }}
        minWidth={250}
        minHeight={150}
      />
      <Paper className="min-w-[250px] min-h-[150px] p-2 h-full w-full">
        <Flex direction={"column"} className="h-full">
          <Flex
            direction={"row"}
            justify={"start"}
            align={"end"}
            className="gap-1"
          >
            <IconNote
              className="p-1"
              fill={isDarkMode ? "#CED4DA" : "#2e2e2e"}
              stroke={1.5}
            />
            <Text fw={500}>Note</Text>
          </Flex>
          <Textarea
            className="w-full"
            styles={{
              root: {
                height: "100%",
              },
              wrapper: {
                height: "100%",
              },
              input: {
                minHeight: rem(108), // Idk why this is needed to make it expand properly
                height: "100%",
              },
            }}
            onChange={handleTextAreaChange}
            variant="unstyled"
            value={note}
            placeholder="Type your note here"
          />
        </Flex>
      </Paper>
    </>
  );
});
