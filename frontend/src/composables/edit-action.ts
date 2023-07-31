import { ref } from "vue";

const undoFn = ref<(() => void) | null>(null);
const redoFn = ref<(() => void) | null>(null);

const deleteFn = ref<(() => void) | null>(null);
const cloneFn = ref<(() => void) | null>(null);

export const useEditAction = () => {
  return {
    undoFn,
    redoFn,
    deleteFn,
    cloneFn,
  };
};
