import { Box, Button, CopyButton, Tabs, Text } from "@mantine/core"
import { ContextModalProps } from "@mantine/modals"
import { IconClipboard, IconClipboardCheck } from "@tabler/icons-react";
import { useEffect } from "react";
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import useCodeGenRepo from "../../data/repo/useCodeGenRepo";
import { useEditorStore } from "../../store/useEditorStore";


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
          <Tabs.Tab value="functions">
            Functions
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel className="overflow-hidden" flex={1}  value="types">
          <TypesPanel />
        </Tabs.Panel>

        <Tabs.Panel className="overflow-hidden" flex={1}  value="functions">
          <FunctionsPanel />
        </Tabs.Panel>

      </Tabs>
    </Box>
  )
}


function TypesPanel() {

  const getDataSnap = useEditorStore((state) => state.getDataSnapshot);

  const { typeString, typesList, selectTable} = useCodeGenRepo(getDataSnap())

  return(
    <>
      <Box className="h-full p-4 border-[1px] border-t-0 border-neutral-500 border-opacity-25 rounded-b-md">

        <Tabs className="h-full" variant="pills" orientation="vertical" placement="right" radius='md' defaultValue='all'>
          <Tabs.List>
            <Tabs.Tab value="all" onClick={()=>selectTable(undefined)}>
              All
            </Tabs.Tab>
            {
              typesList.map((item)=>(
                <Tabs.Tab key={item} value={item} onClick={()=>selectTable(item)}>
                  {item}
                </Tabs.Tab>
              ))
            }
          </Tabs.List>

          <Box className="mr-4 flex-grow overflow-hidden">
            
            <Box className="h-full w-full relative rounded-md overflow-hidden">

              <Box className="absolute top-2 right-6">
                <CopyButton timeout={2000} value={typeString} >
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
                {typeString}
              </SyntaxHighlighter>
            </Box>

          </Box>

        </Tabs>

      </Box>
    </>
  )
}

function FunctionsPanel() {

  const getDataSnap = useEditorStore((state) => state.getDataSnapshot);

  const { functionString, typesList, selectTable} = useCodeGenRepo(getDataSnap())

  return(
    <>
      <Box className="h-full p-4 border-[1px] border-t-0 border-neutral-500 border-opacity-25 rounded-b-md">

        <Tabs className="h-full" variant="pills" orientation="vertical" placement="right" radius='md' defaultValue='all'>
          <Tabs.List>
            <Tabs.Tab value="all" onClick={()=>selectTable(undefined)}>
              All
            </Tabs.Tab>
            {
              typesList.map((item)=>(
                <Tabs.Tab key={item} value={item} onClick={()=>selectTable(item)}>
                  {item}
                </Tabs.Tab>
              ))
            }
          </Tabs.List>

          <Box className="mr-4 flex-grow overflow-hidden">
            
            <Box className="h-full w-full relative rounded-md overflow-hidden">

              <Box className="absolute top-2 right-6">
                <CopyButton timeout={2000} value={functionString} >
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
                {functionString}
              </SyntaxHighlighter>
            </Box>

          </Box>

        </Tabs>

      </Box>
    </>
  )
}

export default CodeGenModal