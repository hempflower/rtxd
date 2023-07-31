import { createApp, ref, watch, computed, toRefs } from "vue";
import type { ToRef, Ref, Component } from "vue";
import type { LabNodeContext } from "@/nodes";
export const createHooksFromVue = (component: Component) => {
  const app = createApp(component);
  const mount = (element: HTMLElement) => {
    app.mount(element);
  };
  const unmount = () => {
    console.log("Unmount");
    app.unmount();
  };

  return {
    mount: (el: HTMLElement) => mount(el),
    unmount: () => unmount(),
    getApp: () => app,
  };
};

export const getPersistentData = <T extends object>(context: LabNodeContext,defaultValue: T): {
    [K in keyof T]: ToRef<T[K]>;
  }  => {
    const persistentData = ref<object>({});
    // load persistent data
    if (context.loadData()) {
      try {
        persistentData.value = JSON.parse(context.loadData());
      } catch (e) {
        console.log(e);
      }
    }
    // watch persistent data
    watch(
      persistentData,
      (newData) => {
        context.saveData(JSON.stringify(newData));
      },
      { deep: true }
    );

    persistentData.value = {
        ...defaultValue,
        ...persistentData.value,
      };
  
    return toRefs<T>(persistentData.value as T);
};
