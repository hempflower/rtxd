import { LabNode } from "@/nodes/index";
import { getPersistentData } from "@/nodes/utils";
import type { LabNodeHooks, LabNodeContext } from "@/nodes";
import LadNodeView from "./node-view.vue";
import { App, createApp, ref } from "vue";
import ElementPlus from "element-plus";
import { fi } from "element-plus/es/locale";

export const createNodeHooks = (context: LabNodeContext): LabNodeHooks => {
  // Vue app instance
  let app: App<Element>;
  // Persistent data
  const { splitter, keepSplitter } = getPersistentData(context, {
    splitter: "\n",
    keepSplitter: false,
  });

  // Implement buffer
  const stringBuffer = ref<string>("");

  const outAction = context.addActionOutput("output", "输出", "string");

  // Add input and output
  context
    .addActionInput("input_action", "文本输入", ["string"])
    .onAction((data) => {
      if (data?.type !== "string") {
        return;
      }
      const text = data.data as string;
      stringBuffer.value += text;

      // Split text
      const subString = stringBuffer.value.split(splitter.value);

      // remove last element
      stringBuffer.value = subString.pop() || "";

      // output
      subString.forEach((s) => {
        outAction.invokeAction({
          data: s + (keepSplitter.value ? splitter.value : ""),
          type: "string",
        });
      });
    });

  context.addActionInput("clear_action", "清空缓冲内容", []).onAction(() => {
    stringBuffer.value = "";
  });

  return {
    onMount: (el: HTMLElement) => {
      // vue instance must be created in onMount
      app = createApp(LadNodeView);
      app.use(ElementPlus);

      // pass data to vue instance
      app.provide("splitter", splitter);
      app.provide("keepSplitter", keepSplitter);

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
  name: "node-text-splitter",
  label: "文本分割器",
  description: "根据指定的字符串分割文本",
  vendor: "Evan Xiao",
  category: "文本",
  hooks: (context) => createNodeHooks(context),
};
