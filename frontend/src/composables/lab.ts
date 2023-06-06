import { ILabClient } from "@/client/client";
import { createLabClient } from "@/client/index";

let labClient: ILabClient | undefined;

export const useLabClient = () => {
  if (!labClient) {
    labClient = createLabClient();
  }
  return { labClient };
};
