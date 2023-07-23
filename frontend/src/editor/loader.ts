import type {
  NodesAndConnections,
  EditorSerializeJsonV0,
  EditorSerializeJsonBase,
} from "./types";

export const loadFromJson = (content: string): NodesAndConnections => {
  const jsonObj = JSON.parse(content) as EditorSerializeJsonBase;
  if (jsonObj.type !== "lab-nodes-document") {
    throw new Error(`Invalid type: ${jsonObj.type}`);
  }
  if (jsonObj.version === 0) {
    return jsonObj as EditorSerializeJsonV0;
  } else {
    throw new Error(`Invalid version: ${jsonObj.version}`);
  }
};

export const saveToJson = (data: NodesAndConnections): string => {
  const jsonObj = {
    version: 0,
    type: "lab-nodes-document",
    ...data,
  } as EditorSerializeJsonV0;
  return JSON.stringify(jsonObj, null, 2);
};
