import { Box, Button, Code, CopyButton, ScrollArea, Tabs, Text } from "@mantine/core"
import { ContextModalProps } from "@mantine/modals"
import { IconClipboard, IconClipboardCheck } from "@tabler/icons-react";
import { useEffect } from "react";
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";


function CodeGenModal({ context, id, innerProps }: ContextModalProps) {

  useEffect(() => {
    context.updateModal({
      modalId: id,
      title: (
        <Text fw={700} size="xl">
          {"Code Generation"}
        </Text>
      ),
      size: "xl",
      centered: false
    });
  }, []);

  return(
    <Box className="flex min-h-[500px] max-h-[700px]">
      <Tabs className="flex-col w-full " display='flex' style={{ flexDirection: 'column' }} variant="outline" radius='md' defaultValue='types'>
        <Tabs.List>
          <Tabs.Tab value="types">
            Types
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel className="overflow-hidden" flex={1}  value="types">
          <TypesPanel />
        </Tabs.Panel>

      </Tabs>
    </Box>
  )
}


function TypesPanel() {

  const codeSample = `  
  export type EmojiData = {
    emoji: string,
    hexcode: string,
    group: string,
    subgroup: string,
    annotation: string,
    tags: string[],
    shortcodes: string[],
    emoticons: string[],
    directional: boolean,
    variation: boolean,
    variationBase: string | null,
    unicode: number,
    order: number,
    skintone: string | null,
    skintoneCombination: string | null,
    skintoneBase: string | null,
  };
`;

  return(
    <>
      <Box className="h-full p-4 border-[1px] border-t-0 border-neutral-700 rounded-b-md">

        <Tabs className="h-full" variant="pills" orientation="vertical" placement="right" radius='md' defaultValue='all'>
          <Tabs.List>
            <Tabs.Tab value="all">
              All
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel className="mr-4 overflow-hidden" value="all">
            
            <Box className="h-full w-full relative rounded-md overflow-hidden">

              <Box className="absolute top-2 right-6">
                <CopyButton timeout={2000} value={codeSample} >
                  {({ copied, copy }) => (
                    <Button 
                      size="xs" 
                      variant="light"
                      leftSection={ copied ? <IconClipboardCheck size={16}/> : <IconClipboard size={16}/>} 
                      onClick={copy}
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  )}
                </CopyButton>
              </Box>
              
              <SyntaxHighlighter 
                customStyle={{
                  width: '100%',
                  height: '100%',
                  overflow: 'auto',
                  fontSize: 14,
                }} 
                language="typescript" 
                style={atomOneDark}
              >
                {codeSample}
              </SyntaxHighlighter>
            </Box>

          </Tabs.Panel>

        </Tabs>

      </Box>
    </>
  )
}

export default CodeGenModal