import { LabNode } from "@/nodes/index";
import { getPersistentData } from "@/nodes/utils";
import type { LabNodeHooks, LabNodeContext } from "@/nodes";
import LadNodeView from "./node-view.vue";
import { App, createApp } from "vue";
import ElementPlus from "element-plus";

export const createNodeHooks = (context: LabNodeContext): LabNodeHooks => {
  // Vue app instance
  let app: App<Element>;

  const onClick = () => {
    context.invokeAction("on_click")
  }

  const onDbClick = () => {
    context.invokeAction("on_dbclick")
  }

  // Add input and output
  context.addActionOutput("on_click", "被单击", "")
  context.addActionOutput("on_dbclick", "被双击", "")

  return {
    onMount: (el: HTMLElement) => {
      // vue instance must be created in onMount
      app = createApp(LadNodeView);
      app.use(ElementPlus);

      // pass data to vue instance
      app.provide("onClickFn", onClick);
      app.provide("onDbClickFn", onDbClick);

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
  name: "node-button",
  label: "按钮",
  description: "点击后产生一个触发信号",
  vendor: "EvanXiao",
  category: "控件",
  hooks: (context) => createNodeHooks(context),
};
