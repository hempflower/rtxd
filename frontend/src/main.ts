import {createApp} from 'vue'
import App from './App.vue'
import route from './route'

// ElementPlus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// @ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'



const app = createApp(App) 
app.use(route)
app.use(ElementPlus, {locale: zhCn})
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
app.mount('#app')
