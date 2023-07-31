import { useMagicKeys } from "@vueuse/core";
import { watch } from "vue";
import {useDocument} from "@/composables/doc"

const keys = useMagicKeys()
const {save, saveAs, open,close} = useDocument()

export type KeyMap = {
    key: string;
    action: () => void;
}

export const keyMaps: KeyMap[] = [
    {
        key: "ctrl+s",
        action:() => save()
    },
    {
        key: "ctrl+shift+s",
        action:() => saveAs()
    },
    {
        key: "ctrl+o",
        action:() => open()
    },
    {
        key: "ctrl+n",
        action:() => close()
    },
]

export const registerKeyMaps = () => {
    keyMaps.forEach((keyMap) => {
        watch(keys[keyMap.key], (value) => {
            if (value) {
                keyMap.action()
            }
        })
    })
}