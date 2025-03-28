import { useEffect, useState } from "react";
import { IEditorDataSnapshot, NodeState } from "../../types/EditorStoreTypes";
import { EditorNode, TableNode } from "../../types/EditorTypes";

export const isTableNode = (node: EditorNode | Pick<EditorNode, "type" | "id" | "data">): node is TableNode =>{
  return node.type === "table";
}

function hasInvalidFields(nodes: NodeState): boolean {
  return nodes.some((node) => {
    if (isTableNode(node)) {
      // Checks if any field is empty or if the table name is empty
      return (
        node.data.fields.some((field) => !field.name.trim()) ||
        !node.data.name.trim()
      );
    }

    // We don't care about other node types
    return false;
  });
}

function generateTypes(dataSnap: IEditorDataSnapshot, title?: string): string {
  const { nodes, edges } = dataSnap;

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  const filteredNodes = nodes.filter(
    (node): node is TableNode =>
      isTableNode(node) && (!title || node.data.name === title)
  );

  return filteredNodes
    .map((node) => {
      const relations = edges
        .filter((edge) => edge.target === node.id)
        .map((edge) => {
          const sourcetNode = nodeMap.get(edge.source);
          if (sourcetNode && isTableNode(sourcetNode)) {
            return `  ${sourcetNode.data.name.charAt(0).toLowerCase() + sourcetNode.data.name.slice(1)}Id: string;`;
          }
          return "";
        })
        .filter(Boolean)
        .join("\n");

      const fields = node.data.fields
        .map((field) => `  ${field.name}: ${field.type};`)
        .join("\n");

      return `interface ${node.data.name} {\n  id: string;${
        relations ? "\n" + relations : ""
      }${fields ? "\n" + fields : ""}\n}`;
    })
    .join("\n\n");
}

function generateFunctions(dataSnap: IEditorDataSnapshot, title?: string): string {
  const { nodes, edges } = dataSnap;

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  const filteredNodes = nodes.filter(
    (node): node is TableNode =>
      isTableNode(node) && (!title || node.data.name === title)
  );

  
  const converter = `const converter = <T>() => ({\n${
    [
      `   toFirestore: (data: WithFieldValue<T>) => data,`,
      `   fromFirestore: (\n      snap: QueryDocumentSnapshot<T>, \n      options?: SnapshotOptions\n   ) => {\n${
      [
        `       const data = snap.data(options)`,
        `       return { ...data, id: snap.id }`
      ].join("\n")
      }\n   }`
    ].join("\n")
  }\n})\n\n`

  const generatedCode = filteredNodes
    .map((node) => {

      const relations = edges
        .filter((edge) => edge.target === node.id)
        .map((edge) => {
          const sourceNode = nodeMap.get(edge.source);
          if (sourceNode && isTableNode(sourceNode)) {
            return sourceNode.data.name.toLowerCase()
          }
          return "";
        })
        .filter(Boolean)
        .join("\n");


      const relationsNameUpperCase = relations.charAt(0).toUpperCase() + relations.slice(1)
      const relationsNameLowerCase = relations.charAt(0).toLocaleLowerCase() + relations.slice(1)
      const name = node.data.name
      const nameUpperCase = name.charAt(0).toUpperCase() + name.slice(1)
      const nameLowerCase = name.charAt(0).toLocaleLowerCase() + name.slice(1)

      const typeConverter = `const ${nameLowerCase}Converter = converter<User>()`

      const getById = `export async function get${nameUpperCase}ById(id: string): Promise<${nameUpperCase} | null>{\n${
        [
          `   const docRef = await getDoc(`,
          `       doc(firestore, '${nameLowerCase}', id).withConverter(${nameLowerCase}Converter)\n   )\n`,
          `   if(!docRef.exists()) return null\n`,
          `   return docRef.data()`,
        ].join("\n")
      }\n}`

      const getList = `export async function get${nameUpperCase}s(): Promise<${nameUpperCase}[]>{\n${
        [
          `   const colRef = await getDocs(`,
          `       collection(firestore, '${nameLowerCase}').withConverter(${nameLowerCase}Converter)\n   )\n`,
          `   return colRef.docs.map(doc => ({...doc.data()}))`,
        ].join("\n")
      }\n}`

      const getListById = `export async function get${nameUpperCase}sBy${relationsNameUpperCase}Id(${relationsNameLowerCase}Id: string): Promise<${nameUpperCase}[]>{\n${
        [
          `   const queryRef = query(`,
          `       collection(firestore, '${nameLowerCase}')`,
          `       where("${relationsNameLowerCase}Id", "==", ${relationsNameLowerCase}Id)`,
          `   )\n`,
          `   const colRef = await getDocs(queryRef.withConverter(${nameLowerCase}Converter)\n`,
          `   return colRef.docs.map(doc => ({...doc.data()}))`,
        ].join("\n")
      }\n}`

      return [
        typeConverter,
        getById,
        getList,
        relations != "" ? getListById : null
      ].join("\n\n")
    })
    .join("\n")

  return [
    converter,
    generatedCode,
  ].join("\n")
}

function useCodeGenRepo(dataSnap: IEditorDataSnapshot) {
  const { nodes } = dataSnap;

  const [selectedTable, setSelectedTable] = useState<string | undefined>(
    undefined
  );
  const [typeString, setTypeString] = useState<string>("");
  const [functionString, setFunctionString] = useState<string>("");

  const typesList = nodes
    .filter(isTableNode)
    .map((node) => node.data.name || "");

  useEffect(() => {
    setTypeString(generateTypes(dataSnap, selectedTable));
    setFunctionString(generateFunctions(dataSnap, selectedTable));
  }, [dataSnap, selectedTable]);

  const selectTable = (title: string | undefined) => {
    setSelectedTable(title);
  };

  return {
    typeString,
    functionString,
    typesList,
    selectTable,
    hasInvalidFields,
  };
}

export default useCodeGenRepo;
