/**
 * Basic state. Including connection status, editor status, etc.
 */

import { ref } from "vue";
import { useLabClient } from "@/composables/lab";
import type { ILabClient } from "@/client/client";

let labClient: ILabClient | null = null;

const connectionState = ref({
  connected: false,
  interface: "",
  protocol: "",
});

export const useConnectionState = () => {
  if (!labClient) {
    labClient = useLabClient().labClient;
    labClient.events.on("connect", () => {
      connectionState.value.connected = true;
    });
    labClient.events.on("disconnect", () => {
      connectionState.value.connected = false;
    });
  }
  return { connectionState };
};
