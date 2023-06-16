import { ElNotification } from 'element-plus'

export const useNotify = () => {
  const notify = (
    title: string,
    message: string,
    type: "success" | "warning" | "info" | "error" = "info"
  ) => {
    ElNotification({
      title,
      message,
      type,
      position: "bottom-right",
    });
  };

  return {
    notify,
  };
};
