import { createHooksFromVue } from "@/nodes/utils";
import type {
  LabNodeHooks,
  LabNodeContext,
  LabNode,
  ActionPayload,
} from "@/nodes";
import LadNodeView from "./node-view.vue";
import ElementPlus from "element-plus";

import { ref, createApp } from "vue";
import type { App } from "vue";

export const createNodeHooks = (context: LabNodeContext): LabNodeHooks => {
  let app: App<Element>;

  const inputAction = context.addActionInput("action", "输入", ["string"]);
  const outputAction = context.addActionOutput("action", "输出", "bytes");
  const inputData = context.addDataInput("input", "输入", ["string"]);
  const outputData = context.addDataOutput("output", "输出", "bytes");

  inputAction.onAction((data?: ActionPayload) => {
    if (!data) {
      return;
    }

    const bytes = new TextEncoder().encode(data.data as string).buffer;
    outputAction.invokeAction({
      data: bytes,
      type: "bytes",
    });
  });

  outputData.onOutputData(() => {
    const input = inputData.readData();
    if (!input) {
      return null;
    }

    if (input.type === "string") {
      const bytes = new TextEncoder().encode(input.data as string).buffer;
      return {
        data: bytes,
        type: "bytes",
      };
    }

    return null;
  });

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
    }
  };
};

export default <LabNode>{
  name: "node-string-to-bytes",
  label: "文本转二进制",
  description: "可以将文本数据转换为二进制数据",
  vendor: "Evan Xiao",
  category: "文本",
  hooks: (context) => createNodeHooks(context),
};
