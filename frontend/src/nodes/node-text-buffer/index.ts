import { createHooksFromVue } from "@/nodes/utils";
import type { LabNodeHooks, LabNodeContext, LabNode, ActionPayload } from "@/nodes";
import LadNodeView from "./node-view.vue";
import ElementPlus from "element-plus";

import { ref, createApp } from "vue";
import type { App } from "vue";
export const createNodeHooks = (context: LabNodeContext): LabNodeHooks => {
  let app: App<Element>;

  const textBuffer = ref("");
  const scrollNotify = ref(false);

  const dataAction = context.addActionInput("data", "触发输入", []);
  const clearAction = context.addActionInput("clear", "清空", []);
  const scrollAction = context.addActionInput("scroll", "滚动", []);
  const autoScrollData = context.addDataInput("autoScroll", "自动滚动", ['boolean']);
  const encodingData = context.addDataInput("encoding", "字符编码", ['string']);

  dataAction.onAction((data?: ActionPayload) => {
    if (!data) {
      return;
    }
    // If data is bytes, convert to string
    if (data?.type === "bytes") {
      // Check if encoding is set
      let encoding = encodingData.readData()?.data as
        | string
        | undefined;
      if (!encoding) {
        encoding = "utf-8";
      }

      const decoder = new TextDecoder(encoding);
      const text = decoder.decode(data.data as ArrayBuffer);

      textBuffer.value += text;
    } else {
      textBuffer.value += data.data as string;
    }

    // Auto scroll
    if (autoScrollData.readData()?.data) {
      scrollNotify.value = !scrollNotify.value;
    }
  });

  clearAction.onAction(() => {
    textBuffer.value = "";
  })

  scrollAction.onAction(() => {
    scrollNotify.value = !scrollNotify.value;
  })


  return {
    onMount: (el: HTMLElement) => {
      app = createApp(LadNodeView);
      app.use(ElementPlus);
      app.provide("readInput", (name: string) => {
        return context.readInput(name);
      });

      app.provide("invokeAction", (name: string) => {
        context.invokeAction(name);
      });

      app.provide("updateNode", () => {
        context.updateNode();
      });

      app.provide("textBuffer", textBuffer);
      app.provide("scrollNotify", scrollNotify);

      app.mount(el);
    },
    onUnmount: () => {
      app.unmount();
    },
    onStart: () => {
      //
      textBuffer.value = "";
    },
    onStop: () => {
      //
      textBuffer.value = "";
    },
  };
};

export default <LabNode>{
  name: "node-text-buffer",
  label: "文本显示器",
  description: "记录并展示输入的字符数据",
  vendor: "Evan Xiao",
  category: "文本",
  hooks: (context) => createNodeHooks(context),
};
