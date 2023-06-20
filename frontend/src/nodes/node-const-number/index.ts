import { createHooksFromVue, LabNode } from "@/nodes/index";
import type { LabNodeHooks, LabNodeContext } from "@/nodes";
import LabNodeConstNumber from "./node-view.vue";
import ElementPlus from "element-plus";
import { ref } from "vue";

export const createNodeConstNumberHooks = (
  context: LabNodeContext
): LabNodeHooks => {
  const { onMount, onUnmount, app } = createHooksFromVue(LabNodeConstNumber);
  app.use(ElementPlus);

  const value = ref(0);

  return {
    onCreate: () => {
      app.provide("readInput", (name: string) => {
        return context.readInput(name);
      });

      app.provide("invokeAction", (name: string) => {
        context.invokeAction(name);
      });

      app.provide("value", value);
    },
    onDataOutput: (name: string) => {
      if (name === "output") {
        return {
          data: value.value,
          type: "number",
        };
      }
    },
    onMount,
    onUnmount,
  };
};

export default <LabNode>{
  name: "node-const-number",
  label: "数值常量",
  description: "提供一个数值常量",
  vendor: "Evan Xiao",
  inputs: [],
  outputs: [
    {
      name: "output",
      label: "数值",
      type: "data",
      dataType: "number",
    },
  ],
  hooks: (context) => createNodeConstNumberHooks(context),
};
