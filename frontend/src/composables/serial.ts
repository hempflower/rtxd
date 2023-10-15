import { ref,onMounted,onBeforeUnmount } from 'vue';
import { getSerialPorts } from "@/serial";
import type { SerialOptions } from "@/serial";

export interface SerialOptionsWithPath extends SerialOptions {
    path: string;
}

export const useSerialList = () => {
    const serialPorts = ref<string[]>([]);
    let interval : number;
    const listSerialPorts = async () => {
        serialPorts.value = await getSerialPorts();
    };

    onMounted(() => {
        listSerialPorts();
        interval = setInterval(listSerialPorts, 500);
    })

    onBeforeUnmount(() => {
        clearInterval(interval);
    })

    return { serialPorts, listSerialPorts };
};


export const useSerialOptionsModel = () => {
    const serialOptions = ref<SerialOptionsWithPath>({
        path: "",
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: "none",
    });

    return { serialOptions };
}
