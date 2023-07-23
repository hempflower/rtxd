import { Component, createApp } from "vue";

// Nodes
import LabNodeDebug from "./node-test";
import LabNodeCounter from "./node-counter";
import LabNodeTimer from "./node-timer";
import LabNodeDataView from "./node-data-view";
import LabNodeConstNumber from "./node-const-number";
import LabNodeSerialControl from "./node-serial-control";
import LabNodeTextBuffer from "./node-text-buffer";
import LabNodeTextSender from "./node-text-sender";
import LabNodeStringToBytes from "./node-string-to-bytes";

export type LabNodeHooks = {
  onCreated?: () => void;
  onDestroy?: () => void;
  onMount: (element: HTMLElement) => void;
  onUnmount: () => void;
  onStart?: () => void;
  onStop?: () => void;
  onAction?: (name: string, data?: ActionPayload) => void;
  onDataOutput?: (name: string) =>
    | {
        data: unknown;
        type: string;
      }
    | null;
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
  inputs: LabNodeInput[];
  outputs: LabNodeOutput[];
};

export interface LabNodeContext {
  readInput(
    name: string
  ): { data: unknown; type: string } | null;
  invokeAction(name: string, data?: ActionPayload): void;
  updateNode(): void;
  loadData(): string;
  saveData(data: string): void;
}

export const createHooksFromVue = (
  component: Component,
  props?: Record<string, unknown>
) => {
  const app = createApp(component, props);
  const mount = (element: HTMLElement) => {
    app.mount(element);
  };
  const unmount = () => {
    app.unmount();
  };
  return {
    onMount: mount,
    onUnmount: unmount,
    app,
  };
};

const nodes: LabNode[] = [
  LabNodeDebug,
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
