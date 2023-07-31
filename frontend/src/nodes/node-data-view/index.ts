import { createHooksFromVue } from "@/nodes/utils";
import type {
  LabNodeHooks,
  LabNodeContext,
  LabNode,
  ActionPayload,
} from "@/nodes";
import LabNodeDataView from "./node-view.vue";

import { ref, createApp } from "vue";
import type { App } from "vue";

export const createNodeDataViewHooks = (
  context: LabNodeContext
): LabNodeHooks => {
  let app: App<Element>;

  const dataText = ref("null");
  let timer = 0;

  const inputAction = context.addActionInput("action", "输入", []);
  const inputData = context.addDataInput("input", "输入", []);

  inputAction.onAction((data?: ActionPayload) => {
    if (!data) {
      return;
    }
    // if use action input, clear timer
    stopTimer();
    showData(data.data, data.type);
  });

  const readInput = () => {
    const input = inputData.readData();
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
      readInput();
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
    onMount: (el: HTMLElement) => {
      app = createApp(LabNodeDataView);
      app.provide("dataText", dataText);
      app.mount(el);
    },
    onUnmount: () => {
      app?.unmount();
      if (timer) {
        window.clearInterval(timer);
      }
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
  };
};

export default <LabNode>{
  name: "node-data-view",
  label: "数据显示",
  description: "显示输出的数据",
  vendor: "Evan Xiao",
  category: "数据",
  hooks: (context) => createNodeDataViewHooks(context),
};
