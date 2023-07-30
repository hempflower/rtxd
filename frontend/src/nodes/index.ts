// Nodes
import LabNodeCounter from "./node-counter";
import LabNodeTimer from "./node-timer";
import LabNodeDataView from "./node-data-view";
import LabNodeConstNumber from "./node-const-number";
import LabNodeSerialControl from "./node-serial-control";
import LabNodeTextBuffer from "./node-text-buffer";
import LabNodeTextSender from "./node-text-sender";
import LabNodeStringToBytes from "./node-string-to-bytes";

export type LabNodeHooks = {
  onMount: (element: HTMLElement) => void;
  onUnmount: () => void;
  onStart?: () => void;
  onStop?: () => void;
  onAction?: (name: string, data?: ActionPayload) => void;
  onDataOutput?: (name: string) => {
    data: unknown;
    type: string;
  } | null;
};

export type ActionPayload = {
  data: unknown;
  type: string;
};

export type LabNodeInput = {
  name: string;
  label: string;
  type: "data" | "action";
  dataType: string[];
};

export type LabNodeOutput =
  | {
      name: string;
      label: string;
      type: "data";
      dataType: string;
    }
  | {
      name: string;
      label: string;
      type: "action";
      dataType?: string;
    };

export type LabNode = {
  name: string;
  label: string;
  description?: string;
  vendor?: string;
  category?: string;
  hooks: (context: LabNodeContext) => LabNodeHooks;
};

export interface LabNodeInterface {
  name: string;
  isConnected: boolean;
  onConnected: (fn: () => void) => void;
  onDisconnected: (fn: () => void) => void;
}
export interface LabNodeDataInputInterface extends LabNodeInterface {
  acceptTypes: string[];
  readData(): { data: unknown; type: string } | null;
}

export interface LabNodeActionInputInterface extends LabNodeInterface {
  acceptTypes: string[];
  onAction(fn:(data?: ActionPayload)=>void): void;
}

export interface LabNodeDataOutputInterface extends LabNodeInterface {
  dataType: string;
  onOutputData: (fn:() => { data: unknown; type: string } | null) => void;
}

export interface LabNodeActionOutputInterface extends LabNodeInterface {
  dataType: string;
  invokeAction(data?: ActionPayload): void;
}

export interface LabNodeContext {
  readInput(name: string): { data: unknown; type: string } | null;
  invokeAction(name: string, data?: ActionPayload): void;
  updateNode(): void;
  loadData(): string;
  saveData(data: string): void;
  addDataInput(
    name: string,
    label: string,
    acceptTypes: string[]
  ): LabNodeDataInputInterface;
  addActionInput(
    name: string,
    label: string,
    acceptTypes: string[]
  ): LabNodeActionInputInterface;
  addDataOutput(
    name: string,
    label: string,
    dataType: string
  ): LabNodeDataOutputInterface;
  addActionOutput(
    name: string,
    label: string,
    dataType: string
  ): LabNodeActionOutputInterface;
  removeInput(name: string): void;
  removeOutput(name: string): void;
}

const nodes: LabNode[] = [
  LabNodeCounter,
  LabNodeTimer,
  LabNodeDataView,
  LabNodeConstNumber,
  LabNodeSerialControl,
  LabNodeTextBuffer,
  LabNodeTextSender,
  LabNodeStringToBytes,
];

export const getRegisteredNodes = (): LabNode[] => {
  return nodes;
};
