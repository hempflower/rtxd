import { ILabClient } from "@/client/client";
import { createLabClient } from "@/client/index";
import { IChannel } from "@/protocol/protocol";
import { ref, onBeforeUnmount } from "vue";

let _labClient: ILabClient | undefined;

export const useLabClient = () => {
  if (!_labClient) {
    _labClient = createLabClient();
  }
  return { labClient: _labClient };
};

export const useConnectionState = () => {
  const connectionState = ref({
    connected: false,
  });

  const onConnect = () => {
    connectionState.value.connected = true;
  };

  const onDisconnect = () => {
    connectionState.value.connected = false;
  };

  const { labClient } = useLabClient();
  labClient.events.on("connect", onConnect);
  labClient.events.on("disconnect", onDisconnect);

  onBeforeUnmount(() => {
    labClient.events.off("connect", onConnect);
    labClient.events.off("disconnect", onDisconnect);
  });

  return { connectionState };
};

export const useChannels = () => {
  const { labClient } = useLabClient();
  const channels = ref<IChannel[]>([]);

  const onConnect = () => {
    labClient.getChannels().then((_channels) => {
      channels.value = _channels;
    });
  };

  const onDisconnect = () => {
    channels.value = [];
  };

  labClient.events.on("connect", onConnect);
  labClient.events.on("disconnect", onDisconnect);

  onBeforeUnmount(() => {
    labClient.events.off("connect", onConnect);
    labClient.events.off("disconnect", onDisconnect);
  });


  return { channels };
};
