import { useEffect, useState } from "react";
import { IEditorDataSnapshot, NodeState } from "../../types/EditorStoreTypes";
import { EditorNode, TableNode } from "../../types/EditorTypes";

function isTableNode(node: EditorNode): node is TableNode {
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
        .filter((edge) => edge.source === node.id)
        .map((edge) => {
          const targetNode = nodeMap.get(edge.target);
          if (targetNode && isTableNode(targetNode)) {
            return `  ${targetNode.data.name.toLowerCase()}Id: string;`;
          }
          return "";
        })
        .filter(Boolean)
        .join("\n");

      const fields = node.data.fields
        .map((field) => `  ${field.name}: ${field.type};`)
        .join("\n");

      return `interface ${node.data.name} {\n  id: string;${
        fields ? "\n" + fields : ""
      }${relations ? "\n" + relations : ""}\n}`;
    })
    .join("\n\n");
}

function useCodeGenRepo(dataSnap: IEditorDataSnapshot) {
  const { nodes } = dataSnap;

  const [selectedType, setSelectedType] = useState<string | undefined>(
    undefined
  );
  const [typeString, setTypeString] = useState<string>("");

  const typesList = nodes
    .filter(isTableNode)
    .map((node) => node.data.name || "");

  useEffect(() => {
    setTypeString(generateTypes(dataSnap, selectedType));
  }, [dataSnap, selectedType]);

  const selectType = (title: string | undefined) => {
    setSelectedType(title);
  };

  return {
    typeString,
    typesList,
    selectType,
    hasInvalidFields,
  };
}

export default useCodeGenRepo;
