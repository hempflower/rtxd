import { ref } from "vue";
import { Open, Save, SaveAs } from "@/../wailsjs/go/main/LabDocument";
import { EventsOn } from "@/../wailsjs/runtime/runtime";

const filePath = ref("");
const content = ref("");
const isUntitled = ref(true);

EventsOn("document-opened", (data: string) => {
  const parsedData = JSON.parse(data);
  isUntitled.value = false;
  filePath.value = parsedData.filePath;
  content.value = parsedData.content;
});

export const useDocument = () => {
  const open = async () => {
    await Open();
  };

  const save = () => {
    if (isUntitled.value) {
      SaveAs(content.value);
      return;
    }
    Save(content.value);
  };

  const close = () => {
    filePath.value = "Untitled";
    content.value = "";
    isUntitled.value = true;
  };

  return {
    open,
    save,
    close,
    filePath,
    content,
  };
};
