import { LabNode } from "@/nodes/index";
import { getPersistentData } from "@/nodes/utils";
import type { LabNodeHooks, LabNodeContext } from "@/nodes";
import LadNodeView from "./node-view.vue";
import { App, createApp, nextTick } from "vue";
import ElementPlus from "element-plus";

export const createNodeHooks = (context: LabNodeContext): LabNodeHooks => {
  // Vue app instance
  let app: App<Element>;
  // Persistent example
  // If node being saved, foo.value will be saved to node data
  const { url } = getPersistentData(context, {
    url: "https://www.bilibili.com",
  });

  // Add input and output
  const gotoAction = context.addActionInput("goto", "跳转到", ["string"]);
  const refreshAction = context.addActionInput("refresh", "刷新", []);

  gotoAction.onAction((data) => {
    if (!data) {
      return;
    }
    if (data.type === "string") {
      url.value = data.data as string;
    }
  });

  refreshAction.onAction(() => {
    const currentUrl = url.value;
    url.value = "";
    nextTick(() => {
      url.value = currentUrl;
    });
  });

  const urlData = context.addDataOutput("url", "当前URL", "string");
  urlData.onOutputData(() => {
    return {
      data: url.value,
      type: "string",
    };
  });

  return {
    onMount: (el: HTMLElement) => {
      // vue instance must be created in onMount
      console.log("onMount");
      app = createApp(LadNodeView);
      app.use(ElementPlus);

      app.provide("updateNode", () => {
        context.updateNode();
      });
      app.provide("url", url);

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
  name: "node-webview",
  label: "浏览器",
  description: "显示一个网页",
  vendor: "Evan Xiao",
  hooks: (context) => createNodeHooks(context),
};
