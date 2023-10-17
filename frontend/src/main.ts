import { createApp } from "vue";
import App from "./App.vue";
import route from "./route";

// ElementPlus
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

import { ElNotification } from "element-plus";

// @ts-ignore
import zhCn from "element-plus/dist/locale/zh-cn.mjs";

// @ts-ignore
import VueClipboard from "vue3-clipboard";

import "@imengyu/vue3-context-menu/lib/vue3-context-menu.css";
import ContextMenu from "@imengyu/vue3-context-menu";

// KeyMap
import { registerKeyMaps } from "@/key-map";

import { useLogger } from "./composables/logger";

const app = createApp(App);
app.use(route);
app.use(ElementPlus, { locale: zhCn });
app.use(VueClipboard, {});
app.use(ContextMenu);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

const logger = useLogger("main");

app.config.errorHandler = (err) => {
  // Show error in console
  console.error(err);
  logger.error("An javascript error occurred: " + "\n" + (err as Error).stack);
  // Show error by notification
  ElNotification({
    title: "致命错误",
    message: (err as Error).message,
    type: "error",
    position: "bottom-right",
    duration: 0,
  });


};

registerKeyMaps();
app.mount("#app");
