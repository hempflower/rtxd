import { LabNode } from "@/nodes/index";
import { getPersistentData } from "@/nodes/utils";
import type { LabNodeHooks, LabNodeContext } from "@/nodes";
import LadNodeView from "./node-view.vue";
import { App, createApp } from "vue";
import ElementPlus from "element-plus";

export const createNodeHooks = (context: LabNodeContext): LabNodeHooks => {
  // Vue app instance
  let app: App<Element>;
  const { value } = getPersistentData(context, {
    value: "",
  });
  // Add input and output
  const dataOutput = context.addDataOutput("output", "输出", "string");

  dataOutput.onOutputData(() => {
    return {
      data: value,
      type: "string",
    }
  })

  return {
    onMount: (el: HTMLElement) => {
      // vue instance must be created in onMount
      app = createApp(LadNodeView);
      app.use(ElementPlus);

      // pass data to vue instance
      app.provide("value", value);

      app.mount(el);
    },
    onUnmount: () => {
      app.unmount();
    },
    onStart: () => {
      //
    },
    onStop: () => {
      //
    },
  };
};

export default <LabNode>{
  name: "node-const-text",
  label: "文本常量",
  description: "提供一个文本常量",
  vendor: "Evan Xiao",
  category: "文本",
  hooks: (context) => createNodeHooks(context),
};
