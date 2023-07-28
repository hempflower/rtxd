import { createHooksFromVue, LabNode } from "@/nodes/index";
import type { LabNodeHooks, LabNodeContext } from "@/nodes";
import LabNodeDebug from "./node-view.vue";

import { ref } from "vue";

export const createNodeTestHooks = (context: LabNodeContext): LabNodeHooks => {
  const { onMount, onUnmount, getApp } = createHooksFromVue(LabNodeDebug);

  const sendBytes = () => {
    // string 'abcdefghijklmnopqrstuvwxyz'
    const str = "abcdefghijklmnopqrstuvwxyz\n";
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);

    context.invokeAction("output2", {
      data: bytes,
      type: "bytes",
    });
  };

  const timer = ref<number>();

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
      timer.value = window.setInterval(() => {
        sendBytes();
      }, 200);
    },
    onStop: () => {
      //
      window.clearInterval(timer.value);
    },
    onMount,
    onUnmount,
  };
};

export default <LabNode>{
  name: "node-test",
  label: "测试节点",
  description: "这是一个测试节点,早期阶段的测试节点",
  vendor: "Evan Xiao",
  inputs: [
    {
      name: "input1",
      label: "输入1",
      type: "data",
      dataType: ["number"],
    },
    {
      name: "input2",
      label: "触发输入",
      type: "action",
      dataType: ["number"],
    },
  ],
  outputs: [
    {
      name: "output1",
      label: "数值",
      type: "data",
      dataType: "number",
    },
    {
      name: "output2",
      label: "bytes 触发",
      type: "action",
      dataType: "bytes",
    },
    {
      name: "output3",
      label: "触发",
      type: "action",
    },
  ],
  hooks: (context) => createNodeTestHooks(context),
};
