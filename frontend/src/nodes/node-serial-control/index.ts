import { createHooksFromVue, LabNode } from "@/nodes/index";
import type { LabNodeHooks, LabNodeContext, ActionPayload } from "@/nodes";
import LabNodeDebug from "./node-view.vue";
import ElementPlus from "element-plus";

import { ref } from "vue";
import { useSerialOptionsModel } from "@/composables/serial";
import { createSerialPortClient } from "@/serial";
import type { ISerialPortClient } from "@/serial";

export const createNodeHooks = (context: LabNodeContext): LabNodeHooks => {
  const { onMount, onUnmount, app } = createHooksFromVue(LabNodeDebug);
  app.use(ElementPlus);

  const runnning = ref(false);
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

    if (!runnning.value) {
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

      context.invokeAction("onConnect",{
        data: id,
        type: "number"
      });
    });

    serialClient.value.onDisconnect(() => {
      isConnect.value = false;
      connectionId.value = -1;
      context.invokeAction("onDisconnect");
    });

    serialClient.value.open()

  };

  const onCloseSerial = () => {
    // stub
    if (serialClient.value) {
      serialClient.value.close();
      serialClient.value.destory();
      serialClient.value = null;
    }
  };

  const onSerialDataCallback = (data: ArrayBuffer) => {
    // stub
    context.invokeAction("onData", {
      data: data,
      type: "bytes"
      });
  };

  return {
    onCreated: () => {
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
    },
    onStart: () => {
      //
      runnning.value = true;
    },
    onStop: () => {
      //
      runnning.value = false;
      if (isConnect.value) {
        onCloseSerial();
      }
    },
    onDataOutput: (name) => {
      if (name === "serial") {
        return {
          data: connectionId.value,
          type: "number",
        }
      } else {
        return {
          data: isConnect.value,
          type: "boolean",
        }
      }
    },
    onAction: (name,data?: ActionPayload) => {
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
    onMount,
    onUnmount,
  };
};

export default <LabNode>{
  name: "node-serial-control",
  label: "串口控制",
  description: "提供串口连接功能",
  vendor: "Evan Xiao",
  inputs: [
    {
      name: "connect",
      label: "连接",
      type: "action",
      dataType: [],
    },
    {
      name: "disconnect",
      label: "断开",
      type: "action",
      dataType: [],
    },
    {
      name: "data",
      label: "写数据",
      type: "action",
      dataType: ["bytes"],
    }
  ],
  outputs: [
    {
      name: "serial",
      label: "连接 ID",
      type: "data",
      dataType: "string",
    },
    {
      name: "status",
      label: "连接状态",
      type: "data",
      dataType: "boolean",
    },
    {
      name: "onConnect",
      label: "连接",
      type: "action",
      dataType: "number"
    },
    {
      name: "onDisconnect",
      label: "断开",
      type: "action",
    },
    {
      name: "onData",
      label: "收到数据",
      type: "action",
      dataType: "bytes"
    },
  ],
  hooks: (context) => createNodeHooks(context),
};
