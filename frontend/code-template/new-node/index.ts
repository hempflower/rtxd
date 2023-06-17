import { createHooksFromVue, LabNode } from "@/nodes/index";
import type { LabNodeHooks, LabNodeContext } from "@/nodes";
import LabNodeDebug from "./node-view.vue";

export const createNodeHooks = (context: LabNodeContext): LabNodeHooks => {
  const { onMount, onUnmount, app } = createHooksFromVue(LabNodeDebug);

  return {
    onCreate: () => {
      app.provide("readInput", (name: string) => {
        return context.readInput(name);
      });

      app.provide("invokeAction", (name: string) => {
        context.invokeAction(name);
      });
    },
    onStart: () => {
      //
    },
    onStop: () => {
      //
    },
    onMount,
    onUnmount,
  };
};

export default <LabNode>{
  name: "node-__name__",
  label: "__label__(noCase)",
  description: "__description__(noCase)",
  vendor: "__vendor__(noCase)",
  inputs: [
    {
      name: "input1",
      label: "输入1",
      type: ["number"],
    },
    {
      name: "input2",
      label: "触发输入",
      type: "action",
    },
  ],
  outputs: [
    {
      name: "output1",
      label: "输出1",
      type: "number",
    },
    {
      name: "output2",
      label: "触发",
      type: "action",
    },
  ],
  hooks: (context) => createNodeHooks(context),
};
