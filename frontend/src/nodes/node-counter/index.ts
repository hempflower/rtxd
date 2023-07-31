import type {
  LabNodeHooks,
  LabNodeContext,
  LabNode,
} from "@/nodes";
import LabNodeCounter from "./node-view.vue";
import { ref, createApp } from "vue";
import type { App } from "vue";

export const createNodeCounterHooks = (
  context: LabNodeContext
): LabNodeHooks => {
  let app: App<Element>;
  const count = ref(0);

  const inputTrigger = context.addActionInput("trigger", "计数", []);
  const inputReset = context.addActionInput("reset", "重置", []);
  const outputCount = context.addDataOutput("count", "计数", "number");

  inputTrigger.onAction(() => {
    count.value++;
  });

  inputReset.onAction(() => {
    count.value = 0;
  });

  outputCount.onOutputData(() => {
    return {
      data: count.value,
      type: "number",
    };
  });

  return {
    onMount: (el: HTMLElement) => {
      app = createApp(LabNodeCounter);
      app.provide("count", count);

      app.mount(el);
    },
    onUnmount: () => {
      app.unmount();
    },
    onStop: () => {
      count.value = 0;
    },
  };
};

export default <LabNode>{
  name: "node-counter",
  label: "触发计数",
  description: "对触发输入进行计数",
  vendor: "Evan Xiao",
  hooks: (node) => createNodeCounterHooks(node),
};
