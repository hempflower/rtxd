import { createHooksFromVue } from "@/nodes/utils";
import type {
  LabNodeHooks,
  LabNodeContext,
  LabNode,
  ActionPayload,
} from "@/nodes";
import LabNodeDebug from "./node-view.vue";
import ElementPlus from "element-plus";

import { ref } from "vue";
import { App, createApp } from "vue";
import { useSerialOptionsModel } from "@/composables/serial";
import { createSerialPortClient } from "@/serial";
import type { ISerialPortClient } from "@/serial";

export const createNodeHooks = (context: LabNodeContext): LabNodeHooks => {
  let app: App<Element>;

  const running = ref(false);
  const isConnect = ref(false);
  const connectionId = ref(-1);
  const { serialOptions } = useSerialOptionsModel();

  const serialClient = ref<ISerialPortClient | null>(null);

  const onOpenSerial = () => {
    // Check if serialOptions is valid
    if (serialOptions.value.path === "") {
      return;
    }

    if (isConnect.value) {
      return;
    }

    if (!running.value) {
      return;
    }

    // Connect to serial port
    serialClient.value = createSerialPortClient(
      serialOptions.value.path,
      serialOptions.value
    );

    serialClient.value.onReceive((data: ArrayBuffer) => {
      onSerialDataCallback(data);
    });

    serialClient.value.onConnect((id) => {
      isConnect.value = true;
      connectionId.value = id;

      outputOnConnectAction.invokeAction()
    });

    serialClient.value.onDisconnect(() => {
      isConnect.value = false;
      connectionId.value = -1;
      outputOnDisconnectAction.invokeAction()
    });

    serialClient.value.open();
  };

  const onCloseSerial = async () => {
    if (serialClient.value) {
      await serialClient.value.close();
      serialClient.value.destroy();
      serialClient.value = null;
    }
  };

  const onSerialDataCallback = (data: ArrayBuffer) => {
    outputOnDataAction.invokeAction({
      data: data,
      type: "bytes",
    });
  };

  // Sockets
  const inputConnectAction = context.addActionInput("connect", "连接", []);
  const inputDisconnectAction = context.addActionInput("disconnect", "断开", []);
  const inputWriteAction = context.addActionInput("data", "写数据", ["bytes"]);

  const outputStatusData = context.addDataOutput("status", "连接状态", "boolean");
  const outputOnConnectAction = context.addActionOutput("connect", "建立连接", "");
  const outputOnDisconnectAction = context.addActionOutput("disconnect", "断开连接", "");
  const outputOnDataAction = context.addActionOutput("data", "收到数据", "bytes");

  inputConnectAction.onAction(() => {
    onOpenSerial();
  });

  inputDisconnectAction.onAction(() => {
    onCloseSerial();
  });

  inputWriteAction.onAction((data?: ActionPayload) => {
    if (!data) {
      return;
    }

    if (data.type === "bytes") {
      if (serialClient.value && isConnect.value) {
        serialClient.value.write(data.data as ArrayBuffer);
      }
    }
  })

  outputStatusData.onOutputData(() => {
    return {
      data: isConnect.value,
      type: "boolean",
    }
  })




  return {
    onMount: (el: HTMLElement) => {
      app = createApp(LabNodeDebug);
      app.use(ElementPlus);
      app.provide("readInput", (name: string) => {
        return context.readInput(name);
      });

      app.provide("invokeAction", (name: string) => {
        context.invokeAction(name);
      });

      app.provide("onOpenSerial", onOpenSerial);
      app.provide("onCloseSerial", onCloseSerial);
      app.provide("isConnect", isConnect);
      app.provide("serialOptions", serialOptions);

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
      if (isConnect.value) {
        onCloseSerial();
      }
    },
    onDataOutput: (name) => {
      if (name === "serial") {
        return {
          data: connectionId.value,
          type: "number",
        };
      } else {
        return {
          data: isConnect.value,
          type: "boolean",
        };
      }
    },
    onAction: (name, data?: ActionPayload) => {
      if (name === "connect") {
        onOpenSerial();
      } else if (name === "disconnect") {
        onCloseSerial();
      } else if (name === "data") {
        if (serialClient.value && isConnect.value && data) {
          if (data.type === "bytes") {
            serialClient.value.write(data.data as ArrayBuffer);
          }
        }
      }
    },
  };
};

export default <LabNode>{
  name: "node-serial-control",
  label: "串口控制",
  description: "提供串口连接功能",
  vendor: "Evan Xiao",
  category: "串口",
  hooks: (context) => createNodeHooks(context),
};
