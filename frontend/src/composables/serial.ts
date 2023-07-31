import { ref,onMounted,onBeforeUnmount } from 'vue';
import { getSerialPorts } from "@/serial";

export type SerialOptions = {
    path: string;
    baudRate: number;
    dataBits: 5 | 6 | 7 | 8;
    stopBits: 1 | 1.5 | 2;
    parity: "none" | "even" | "mark" | "odd" | "space";
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
    const serialOptions = ref<SerialOptions>({
        path: "",
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: "none",
    });

    return { serialOptions };
}
