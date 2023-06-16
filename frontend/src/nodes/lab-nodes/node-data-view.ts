import { createHooksFromVue, LabNode } from "@/nodes/index";
import type { LabNodeHooks, LabNodeContext } from "@/nodes";
import LabNodeDataView from "@/nodes/components/LabNodeDataView.vue";

import { ref } from "vue";

export const createNodeDataViewHooks = (context: LabNodeContext): LabNodeHooks => {
  const { onMount, onUnmount, app } = createHooksFromVue(LabNodeDataView);

  const dataText = ref("null");
  let timer: number | null = null;

  const readInput = (name: string) => {
    const input = context.readInput(name);
    if (input.data === null) {
      dataText.value = "null";
    } else {
      dataText.value = JSON.stringify(input.data);
    }
  };

  const startTimer = () => {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(() => {
      readInput("input");
    }, 100);
  };

  const stopTimer = () => {
    if (timer) {
      window.clearInterval(timer);
    }
  };


  return {
    onCreate: () => {
      app.provide("readInput", (name: string) => {
        return context.readInput(name);
      });

      app.provide("invokeAction", (name: string) => {
        context.invokeAction(name);
      });

      app.provide("dataText", dataText);
    },
    onStart: () => {
      //
      startTimer();
    },
    onStop: () => {
      //
      stopTimer();

      dataText.value = "null";
    },
    onMount,
    onUnmount,
  };
};

export default <LabNode>{
  name: "lab-node-data-view",
  label: "数据显示",
  description: "显示输出的数据",
  vendor: "Evan Xiao",
  inputs: [
    {
      name: "input",
      label: "数据",
      type: [],
    },
  ],
  outputs: [],
  hooks: (context) => createNodeDataViewHooks(context),
};
