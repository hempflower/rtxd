import { createHooksFromVue, LabNode } from "@/nodes/index";
import type { LabNodeHooks, LabNodeContext, ActionPayload } from "@/nodes";
import LadNodeView from "./node-view.vue";
import ElementPlus from "element-plus";

import { ref } from "vue";

export const createNodeHooks = (context: LabNodeContext): LabNodeHooks => {
  const { onMount, onUnmount, getApp } = createHooksFromVue(LadNodeView);
  getApp().use(ElementPlus);

  return {
    onCreated: () => {
      getApp().provide("readInput", (name: string) => {
        return context.readInput(name);
      });

      getApp().provide("invokeAction", (name: string) => {
        context.invokeAction(name);
      });
    },
    onStart: () => {
      //
    },
    onStop: () => {
      //
    },
    onAction: (name: string,data?: ActionPayload) => {
      if(!data){
        return;
      }

      const bytes = new TextEncoder().encode(data.data as string).buffer;

      context.invokeAction("action", {
        data: bytes,
        type: "bytes",
      })
    },
    onDataOutput: () => {
      const input = context.readInput("input");
      if (!input) {
        return null;
      }

      if (input.type === "string") {
        const bytes = new TextEncoder().encode(input.data as string).buffer;
        return {
          data: bytes,
          type: "bytes",
        } 
      }

      return null;
    },
    onMount,
    onUnmount,
  };
};

export default <LabNode>{
  name: "node-string-to-bytes",
  label: "文本转二进制",
  description: "可以将文本数据转换为二进制数据",
  vendor: "Evan Xiao",
  category: "文本",
  inputs: [
    {
      name: "input",
      label: "输入",
      type: 'data',
      dataType: ["string"],
    },
    {
      name: "action",
      label: "输入",
      type: "action",
      dataType: ["string"],
    },
  ],
  outputs: [
    {
      name: "output",
      label: "输出",
      type: 'data',
      dataType: "bytes",
    },
    {
      name: "action",
      label: "输出",
      type: "action",
      dataType: "bytes",
    },
  ],
  hooks: (context) => createNodeHooks(context),
};
