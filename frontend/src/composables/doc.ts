import { ref, watch, nextTick } from "vue";
import { Open, Save, SaveAs } from "@/../wailsjs/go/main/LabDocument";
import { EventsOn } from "@/../wailsjs/runtime/runtime";
import { ElMessageBox } from "element-plus";
import type { Action } from "element-plus";


const filePath = ref("Untitled");
const content = ref("");
const isUntitled = ref(true);
const isDirty = ref(false);

watch(content, () => {
  isDirty.value = true;
});

EventsOn("document-opened", (data: { content: string; path: string }) => {
  isUntitled.value = false;
  filePath.value = data.path;
  content.value = data.content;
  nextTick(() => {
    isDirty.value = false;
  });
  onLoadContentFn();
});

let onLoadContentFn : () => void = () => null;

const save = async () => {
  if (isUntitled.value) {
    await SaveAs(content.value);
    return;
  }
  await Save(content.value);
  isDirty.value = false;
};

const askSaveAndRun = async (callback: () => void | Promise<void>) => {
  if (isDirty.value) {
    ElMessageBox.confirm("你有未保存的修改，是否保存？", "修改未保存", {
      distinguishCancelAndClose: true,
      confirmButtonText: "保存",
      cancelButtonText: "放弃修改",
    })
      .then(async () => {
        await save();
      })
      .catch((action: Action) => {
        if (action === "cancel") {
          callback();
        }
      });
  } else {
    await callback();
  }
};

const open = async () => {
  askSaveAndRun(async () => {
    await Open();
  });
};

const saveAs = async () => {
  await SaveAs(content.value);
  isDirty.value = false;
};

const close = async () => {
  askSaveAndRun(async () => {
    filePath.value = "Untitled";
    content.value = "";
    isUntitled.value = true;
    isDirty.value = false;

    onLoadContentFn();
  });
};

const onLoadContent = (fn: () => void) => {
  onLoadContentFn = fn;
};

export const useDocument = () => {
  return {
    open,
    save,
    saveAs,
    close,
    onLoadContent,
    filePath,
    content,
    isDirty,
  };
};
