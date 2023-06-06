import { ref,onMounted,onBeforeUnmount } from 'vue';
import { ListSerialPort } from "@/../wailsjs/go/main/LabSerial"

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
        serialPorts.value = await ListSerialPort();
    };

    onMounted(() => {
        listSerialPorts();
        interval = setInterval(listSerialPorts, 1000);
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

    const setSerialOptions = (options: SerialOptions) => {
        serialOptions.value = options;
    }

    return { serialOptions, setSerialOptions };
}
