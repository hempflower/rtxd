import { createHooksFromVue, LabNode } from "@/nodes/index";
import type { LabNodeHooks, LabNodeContext, ActionPayload } from "@/nodes";
import LabNodeDataView from "./node-view.vue";

import { ref } from "vue";

export const createNodeDataViewHooks = (
  context: LabNodeContext
): LabNodeHooks => {
  const { onMount, onUnmount, app } = createHooksFromVue(LabNodeDataView);

  const dataText = ref("null");
  let timer: number | null = null;

  const readInput = (name: string) => {
    const input = context.readInput(name);
    if (!input) {
      dataText.value = "null";
    } else {
      showData(input.data, input.type);
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

  const showData = (data: unknown, type: string) => {
    // Workaround for bytes
    if (type === "bytes") {
      // Hex style
      const bytes = new Uint8Array(data as ArrayBuffer);
      let text = "(HEX) ";
      for (let i = 0; i < bytes.length; i++) {
        text += bytes[i].toString(16).padStart(2, "0") + " ";
      }
      dataText.value = text;

    } else {
      dataText.value = JSON.stringify(data);
    }
  };

  return {
    onCreated: () => {
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
    onAction: (name: string, data?: ActionPayload) => {
      if (name === "on_input") {
        if (data?.data) {
          // if use action input, clear timer
          stopTimer();
          showData(data.data, data.type);
        }
      }
    },
    onMount,
    onUnmount,
  };
};

export default <LabNode>{
  name: "node-data-view",
  label: "数据显示",
  description: "显示输出的数据",
  vendor: "Evan Xiao",
  inputs: [
    {
      name: "input",
      label: "数据",
      type: "data",
      dataType: [],
    },
    {
      name: "on_input",
      label: "触发输入",
      type: "action",
      dataType: [],
    },
  ],
  outputs: [],
  hooks: (context) => createNodeDataViewHooks(context),
};
