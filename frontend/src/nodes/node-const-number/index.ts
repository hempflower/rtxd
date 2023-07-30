import { getPersistentData } from "@/nodes/utils";
import type {
  LabNodeHooks,
  LabNodeContext,
  LabNode,
  ActionPayload,
} from "@/nodes";
import LabNodeConstNumber from "./node-view.vue";
import ElementPlus from "element-plus";
import { ref, createApp } from "vue";
import type { App } from "vue";

export const createNodeConstNumberHooks = (
  context: LabNodeContext
): LabNodeHooks => {
  let app: App<Element>;
  const value = ref(0);
  const outputHandle =  context.addDataOutput("output", "输出", "number")

  outputHandle.onOutputData(() => {
    return {
      data: value.value,
      type: "number",
    };
  })

  return {
    onMount: (el: HTMLElement) => {
      app = createApp(LabNodeConstNumber);
      app.use(ElementPlus);
      app.provide("value", value);
      app.mount(el);
    },
    onUnmount: () => {
      app.unmount();
    },
    onDataOutput: (name: string) => {
      if (name === "output") {
        return {
          data: value.value,
          type: "number",
        };
      }

      return null;
    },
  };
};

export default <LabNode>{
  name: "node-const-number",
  label: "数值常量",
  description: "提供一个数值常量",
  vendor: "Evan Xiao",
  hooks: (context) => createNodeConstNumberHooks(context),
};
