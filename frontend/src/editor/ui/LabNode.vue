<template>
    <div class="node" :class="{ selected: data.selected }" :style="nodeStyle">
        <div class="title">{{ props.data.label }}</div>
        <!-- CONTROL -->
        <div class="control" v-for="[key, control] in controls" :key="key"
            :ref="el => onRef((el as HTMLElement), key, control, 'control')"></div>
        <div class="interface">
            <div class="inputs">
                <!-- INPUT -->
                <div class="input" v-for="[key, input] in inputs" :key="key">
                    <div class="input-socket" :ref="(el) => onRef((el as HTMLElement), key, input, 'input')"></div>
                    <div class="input-label">{{ input.label }}</div>
                </div>
            </div>
            <div class="outputs">
                <!-- OUTPUT -->
                <div class="output" v-for="[key, output] in outputs" :key="key">
                    <div class="output-label">{{ output.label }}</div>
                    <div class="output-socket" :ref="(el) => onRef((el as HTMLElement), key, output, 'output')">
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue'
import { ClassicPreset } from "rete";

type emitFnType = (opt: {
    type: 'render'
    data: {
        type: 'socket',
        side: 'input' | 'output',
        key: string,
        nodeId: string,
        element: HTMLElement
        payload: unknown
    } |
    {
        type: 'control',
        element: HTMLElement
        payload: unknown
    }
}) => void


type labelWithIndexType = {
    index: number
    label: string
}

const props = defineProps<{
    data: {
        id: string,
        label: string,
        height?: number,
        width?: number,
        selected: boolean,
        outputs: {
            [key: string]: {
                index: number
                label: string
            }
        },
        inputs: {
            [key: string]: {
                index: number
                label: string
            }
        },
        controls: {
            [key: string]: {
                index: number
                label: string
            }
        },
    },
    emit: emitFnType
}>()

const sortByIndex = (entries: [string, labelWithIndexType][]): [string, labelWithIndexType][] => {
    return entries.sort((a, b) => {
        const aIndex = a[1].index ?? 0
        const bIndex = b[1].index ?? 0
        return aIndex - bIndex
    })
}

const onRef = (element: HTMLElement, key: string, entity: unknown, type: 'output' | 'input' | 'control') => {
    if (type === 'control') {
        props.emit({
            type: 'render',
            data: {
                type: 'control',
                element,
                payload: entity
            }
        })
    } else {
        props.emit({
            type: 'render',
            data: {
                type: 'socket',
                side: type,
                key,
                nodeId: props.data.id,
                element,
                payload: (entity as ClassicPreset.Port<ClassicPreset.Socket>).socket
            }
        })
    }
}


const nodeStyle = computed(() => {
    const nodeHeight = Number.isFinite(props.data.height) ? `${props.data.height}px` : ''
    const nodeWidth = Number.isFinite(props.data.width) ? `${props.data.width}px` : ''
    return {
        height: nodeHeight,
        width: nodeWidth
    }
})

const outputs = computed(() => {
    return sortByIndex(Object.entries(props.data.outputs ?? {}))
})

const inputs = computed(() => {
    return sortByIndex(Object.entries(props.data.inputs ?? {}))
})

const controls = computed(() => {
    return sortByIndex(Object.entries(props.data.controls ?? {}))
})

</script>

<style lang="scss" scoped>
@import "@/vars.scss";

.node {

    min-width: $node-width;

    border-style: $node-border-style;
    border-width: $node-border-width;
    border-radius: $node-border-radius;
    border-color: $node-line-color;

    transition: box-shadow 0.2s ease-in-out;
    box-shadow: 0 0 3px 0px #00000000;

    background-color: rgba($color: #000000, $alpha: 0.3);

    &:hover,
    &:focus,
    &:active {
        box-shadow: 0 0 4px 4px rgb(90 175 250 / 28%);
    }

    &.selected {
        box-shadow: 0 0 4px 4px rgb(90 175 250 / 28%);
        background-color: rgb(90 175 250 / 11%);
    }

    .title {
        text-align: center;

        font-size: $node-title-size;
        font-weight: $node-title-weight;

        border-bottom-style: dashed;
        border-bottom-width: $node-border-width;
        border-bottom-color: $node-line-color;

        padding: 8px 0;

    }

    .control {
        padding: 8px 8px;
    }

    .interface {
        display: flex;
        flex-direction: row;
        justify-content: space-between;

        border-top: 2px dashed $node-line-color;

        padding: 8px 0;

        .inputs {
            flex: 1;

            .input {
                text-align: left;
                display: flex;
                flex-direction: row;
                
                padding: 8px 0;

                &-label {
                    display: flex;
                    align-items: center;

                    margin: 0 4px;
                    font-size: 12px;
                }

                &-socket {
                    margin-left: -$node-border-width;
                    width: $socket-size * 2;
                    cursor: pointer;
                }
            }
        }

        .outputs {
            flex: 1;

            .output {
                text-align: right;

                display: flex;
                flex-direction: row;
                justify-content: end;


                padding: 8px 0;

                &-label {
                    display: flex;
                    align-items: center;
                    margin: 0 4px;
                    font-size: 12px;
                }

                &-socket {
                    margin-right: -$node-border-width;
                    cursor: pointer;
                }
            }
        }


    }

}
</style>