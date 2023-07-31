import { GetSchemes, ClassicPreset } from "rete";
import { VueArea2D } from "rete-vue-render-plugin";
import { ContextMenuExtra } from "rete-context-menu-plugin";

export type ActionPayload = {
  data: unknown;
  type: string;
};

export type DataType = "string" | "number" | "bytes" | string;
export type DataPayload = {
  data: unknown;
  type: DataType;
};

export type ActionFn = (data?: ActionPayload) => void;
export type DataFn = () => DataPayload | null;

export type Schemes = GetSchemes<
  ClassicPreset.Node,
  ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;
export type AreaExtra = VueArea2D<Schemes> | ContextMenuExtra;

export interface NodesAndConnections {
  nodes: {
    id: string;
    name: string;
    position: {
      x: number;
      y: number;
    };
    data: string;
  }[];
  connections: {
    source: {
      nodeId: string;
      socketId: string;
    };
    target: {
      nodeId: string;
      socketId: string;
    };
  }[];
}

export interface EditorSerializeJsonBase {
  version: number;
  type: string;
}

export interface EditorSerializeJsonV0
  extends NodesAndConnections,
    EditorSerializeJsonBase {}
