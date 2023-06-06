import { createApp } from "vue";
import App from "./App.vue";
import route from "./route";

// ElementPlus
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

import { ElNotification } from 'element-plus'

// @ts-ignore
import zhCn from "element-plus/dist/locale/zh-cn.mjs";

const app = createApp(App);
app.use(route);
app.use(ElementPlus, { locale: zhCn });
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.config.errorHandler = (err, vm, info) => {
  // Show error in console
  console.error(err);

  // Show error by notification
  ElNotification({
    title: "内部错误",
    message: (err as Error).message,
    type: "error",
    position: "bottom-right",

  });
};

app.mount("#app");
