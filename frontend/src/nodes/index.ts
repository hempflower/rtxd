import { Component, createApp } from "vue";

// Nodes
import LabNodeDebug from "./lab-nodes/node-test";
import LabNodeCounter from "./lab-nodes/node-counter";
import LabNodeTimer from "./lab-nodes/node-timer";
import LabNodeDataView from "./lab-nodes/node-data-view";
import LabNodeConstNumber from "./lab-nodes/node-const-number"

export type LabNodeHooks = {
  onCreate?: () => void;
  onDestrory?: () => void;
  onMount: (element: HTMLElement) => void;
  onUnmount: () => void;
  onStart?: () => void;
  onStop?: () => void;
  onAction?: (name: string) => void;
  onDataOutput?: (name: string) => unknown;
};

export type LabNodeInput =
  | {
      name: string;
      label: string;
      type: string[];
    }
  | {
      name: string;
      label: string;
      type: "action";
    };

export type LabNodeOuput =
  | {
      name: string;
      label: string;
      type: string;
    }
  | {
      name: string;
      label: string;
      type: "action";
    };

export type LabNode = {
  name: string;
  label: string;
  description?: string;
  vendor?: string;
  hooks: (context: LabNodeContext) => LabNodeHooks;
  inputs: LabNodeInput[];
  outputs: LabNodeOuput[];
};

export interface LabNodeContext {
  readInput(
    name: string
  ): { data: unknown; type: string } | { data: null; type: null };
  invokeAction(name: string): void;
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
];

export const getNodes = (): LabNode[] => {
  return nodes;
};
