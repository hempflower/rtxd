import { LabNode } from "@/nodes/index";
import { getPersistentData } from "@/nodes/utils";
import type { LabNodeHooks, LabNodeContext } from "@/nodes";
import LadNodeView from "./node-view.vue";
import { App, createApp } from "vue";
import ElementPlus from "element-plus";

export const createNodeHooks = (context: LabNodeContext): LabNodeHooks => {
  // Vue app instance
  let app: App<Element>;
  // Add input and output
  const actionInput = context.addActionInput("action", "输入", []);
  const actionOutput = context.addActionOutput("action", "输出", "*");
  const dataInput = context.addDataInput("input", "输入", []);

  actionInput.onAction(() => {
    actionOutput.invokeAction(dataInput.readData() ?? undefined);
  })

  return {
    onMount: (el: HTMLElement) => {
      // vue instance must be created in onMount
      app = createApp(LadNodeView);
      app.use(ElementPlus);
      app.mount(el)
      
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
  name: "node-data-reader",
  label: "数据读取器",
  description: "主动读取数据",
  vendor: "Evan Xiao",
  category: "数据",
  hooks: (context) => createNodeHooks(context),
};
