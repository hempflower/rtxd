import { useDocument } from "./doc";
import { ref, computed, watch } from "vue";
import { WindowSetTitle } from "@/../wailsjs/runtime/runtime";

const { filePath, isDirty } = useDocument();

export const useTitle = () => {
  const title = ref("{file} - Paramlab - DIY 你专属的上位机");

  const replacedTitle = computed(() => {
    return title.value.replace(
      "{file}",
      filePath.value + (isDirty.value ? "*" : "")
    );
  });

  watch(
    replacedTitle,
    (newTitle) => {
      document.title = newTitle;
      WindowSetTitle(newTitle);
    },
    { immediate: true }
  );

  return {
    title,
  };
};
