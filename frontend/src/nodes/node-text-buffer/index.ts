import { createHooksFromVue, LabNode } from "@/nodes/index";
import type { LabNodeHooks, LabNodeContext } from "@/nodes";
import LadNodeView from "./node-view.vue";
import ElementPlus from "element-plus";

import { ref } from "vue";

export const createNodeHooks = (context: LabNodeContext): LabNodeHooks => {
  const { onMount, onUnmount, app } = createHooksFromVue(LadNodeView);

  app.use(ElementPlus);

  const textBuffer = ref("");
  const scrollNotify = ref(false);

  return {
    onCreate: () => {
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

    },
    onStart: () => {
      //
      textBuffer.value = "";
    },
    onStop: () => {
      //
      textBuffer.value = "";
    },
    onAction(name, data) {
      if (name === "data") {
        if (!data) {
          return;
        }
        // Id data is bytes, convert to string
        if (data?.type === "bytes") {

          // Check if encoding is set
          let encoding = context.readInput("encoding").data as string;
          if (encoding === "") {
            encoding = "utf-8";
          }

          const decoder = new TextDecoder();
          const text = decoder.decode(data.data as ArrayBuffer);

          textBuffer.value += text;
        } else {
          textBuffer.value += data.data as string;
        }

        // Auto scroll
        if (context.readInput("autoScroll").data) {
          scrollNotify.value = !scrollNotify.value;
        }

      } else if (name === "clear") {
        textBuffer.value = "";
      } else if (name === "scroll") {
        // Toggle scrollNotify to trigger scroll
        scrollNotify.value = !scrollNotify.value;
      }
    },
    onMount,
    onUnmount,
  };
};

export default <LabNode>{
  name: "node-text-buffer",
  label: "字符流显示器",
  description: "记录并展示输入的字符数据",
  vendor: "Evan Xiao",
  inputs: [
    {
      name: "data",
      label: "触发输入",
      type: "action",
      dataType: ["string", "bytes"],
    },
    {
      name: "clear",
      label: "清空",
      type: "action",
      dataType: [],
    },
    {
      name: "scroll",
      label: "滚动",
      type: "action",
      dataType: [],
    },
    {
      name: "autoScroll",
      label: "自动滚动",
      type: "data",
      dataType: ["boolean"],
    },
    {
      name: "encoding",
      label: "字符编码",
      type: "data",
      dataType: ["string"],
    }
  ],
  outputs: [],
  hooks: (context) => createNodeHooks(context),
};
