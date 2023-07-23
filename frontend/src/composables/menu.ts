import { Quit } from "@/../wailsjs/runtime/runtime";
import { useDocument } from "@/composables/doc";


const { open, save,saveAs, close } = useDocument();

const menuList = [
  {
    title: "文件",
    items: [
      {
        title: "新建",
        action: () => {
          close();
        },
      },
      {
        title: "打开",
        action: () => {
          open();
        },
      },
      {
        title: "保存",
        action: () => {
          save();
        },
      },
      {
        title: "另存为...",
        action: () => {
          saveAs();
        },
      },
      {
        title: "---",
      },
      {
        title: "设置",
        action: () => {
          console.log("保存");
        },
      },
      {
        title: "退出",
        action: () => {
          Quit();
        },
      },
    ],
  },
  {
    title: "编辑",
    items: [
      {
        title: "撤销",
        action: () => {
          console.log("撤销");
        },
      },
      {
        title: "重做",
        action: () => {
          console.log("重做");
        },
      },
      {
        title: "---",
      },
      {
        title: "剪切",
        action: () => {
          console.log("剪切");
        },
      },
      {
        title: "复制",
        action: () => {
          console.log("复制");
        },
      },
      {
        title: "粘贴",
        action: () => {
          console.log("粘贴");
        },
      },
      {
        title: "删除",
        action: () => {
          console.log("删除");
        },
      },
    ],
  },
  {
    title: "帮助",
    items: [
      {
        title: "使用文档",
        action: () => {
          console.log("帮助");
        },
      },
      {
        title: "开发人员工具",
        action: () => {
          console.log("开发人员工具");
        },
      },
      {
        title: "检查更新",
        action: () => {
          console.log("检查更新");
        },
      },
      {
        title: "关于",
        action: () => {
          console.log("关于");
        },
      },
    ],
  },
];

export default function useMenu() {
  return {
    menuList,
  };
}
