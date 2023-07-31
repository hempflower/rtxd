import { getPersistentData } from "@/nodes/utils";
import type { LabNodeHooks, LabNodeContext, LabNode } from "@/nodes";
import LadNodeView from "./node-view.vue";
import ElementPlus from "element-plus";

import { App, ref, createApp } from "vue";

export const createNodeHooks = (context: LabNodeContext): LabNodeHooks => {
  let app: App<Element>;
  const { inputText, appendLine, enterSend } = getPersistentData(context, {
    inputText: "",
    appendLine: "",
    enterSend: true,
  });

  const inputTextData = context.addDataInput("text", "内容", ["string"]);
  const inputSendAction = context.addActionInput("send", "发送", []);

  const outputTextAction = context.addActionOutput("output", "数据", "string");

  inputSendAction.onAction(() => {
    sendText();
  });

  const running = ref<boolean>(false);

  const sendText = () => {
    if (!running.value) {
      return;
    }

    const textField = inputText.value;
    const exInput = inputTextData.readData();

    let text = "";

    // 优先使用 textField 的内容
    if (textField) {
      text = textField;
    } else if (exInput && exInput.type === "string") {
      text = exInput.data as string;
    } else {
      return;
    }

    // 为了方便调试，将 \n 替换为 \r\n，比如 AT 指令
    text = text.replaceAll("\n", "\r\n");

    outputTextAction.invokeAction({
      data: appendLine.value ? text + "\r\n" : text,
      type: "string",
    })
  };

  const updateNodeConnection = () => {
    context.updateNode();
  };

  return {
    onMount: (el: HTMLElement) => {
      app = createApp(LadNodeView);
      app.use(ElementPlus);
      app.provide("inputText", inputText);
      app.provide("sendText", sendText);
      app.provide("updateNodeConnection", updateNodeConnection);
      app.provide("running", running);
      app.provide("appendLine", appendLine);
      app.provide("enterSend", enterSend);

      app.mount(el);
    },
    onUnmount: () => {
      app.unmount();
    },
    onStart: () => {
      //
      running.value = true;
    },
    onStop: () => {
      //
      running.value = false;
    },
  };
};

export default <LabNode>{
  name: "node-text-sender",
  label: "文字发送",
  description: "将输入的文字以操作形式发送出去",
  vendor: "Evan Xiao",
  category: "文本",
  hooks: (context) => createNodeHooks(context),
};
