import { getPersistentData } from "@/nodes/utils";
import type { LabNodeContext, LabNodeHooks, LabNode } from "@/nodes";
import LabNodeTimer from "./node-view.vue";
import ElementPlus from "element-plus";
import { App, createApp, ref } from "vue";

export const createNodeTimerHooks = (context: LabNodeContext): LabNodeHooks => {
  let app: App<Element>;
  const { timeout } = getPersistentData(context, {
    timeout: 1000,
  });
  const timerAction = context.addActionOutput("on_timer", "触发","");
  const timer = ref(0);
  const startTimer = () => {
    if (timer.value) {
      window.clearInterval(timer.value);
    }
    timer.value = window.setInterval(() => {
      timerAction.invokeAction();
    }, timeout.value);
  };

  const stopTimer = () => {
    if (timer.value) {
      window.clearInterval(timer.value);
    }
  };


  return {
    onMount: (el: HTMLElement) => {
      app = createApp(LabNodeTimer);
      app.use(ElementPlus);
      app.provide("updateTimeout", (time: number) => {
        timeout.value = time;
        // if timer is running, restart it
        if (timer.value) {
          stopTimer();
          startTimer();
        }
      });

      app.provide("timeout", timeout);
      app.mount(el);
    },
    onUnmount: () => {
      app?.unmount();
      if (timer.value) {
        window.clearInterval(timer.value);
      }
    },
    onStart: () => {
      //
      startTimer();
    },
    onStop: () => {
      //
      stopTimer();
    },
  };
};

export default <LabNode>{
  name: "node-timer",
  label: "定时器",
  description: "定时器节点,每隔一段时间触发一次",
  vendor: "Evan Xiao",
  category: "定时/调度",
  hooks: (context) => createNodeTimerHooks(context),
};
