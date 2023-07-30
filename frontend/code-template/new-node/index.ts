import { LabNode } from "@/nodes/index";
import { getPersistentData } from "@/nodes/utils";
import type { LabNodeHooks, LabNodeContext } from "@/nodes";
import LadNodeView from "./node-view.vue";
import { App, createApp } from "vue";
import ElementPlus from "element-plus";

export const createNodeHooks = (context: LabNodeContext): LabNodeHooks => {
  // Vue app instance
  let app: App<Element>;
  // Persistent example
  // If node being saved, foo.value will be saved to node data
  const { foo } = getPersistentData(context, {
    foo: 1,
  });
  console.log(foo.value);
  foo.value++;

  // Add input and output
  context.addActionInput("action", "输入", ["string"]);
  context.addActionOutput("action", "输出", "bytes");
  context.addDataInput("input", "输入", ["string"]);
  context.addDataOutput("output", "输出", "bytes");

  return {
    onMount: (el: HTMLElement) => {
      // vue instance must be created in onMount
      app = createApp(LadNodeView);
      app.use(ElementPlus);

      // pass data to vue instance
      app.provide("foo", foo);

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
  name: "node-__name__",
  label: "__label__(noCase)",
  description: "__description__(noCase)",
  vendor: "__vendor__(noCase)",
  hooks: (context) => createNodeHooks(context),
};
