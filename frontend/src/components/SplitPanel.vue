<template>
    <div class="split-container">
        <!-- Left panel -->
        <div :style="{ width: leftPanelWidth + 'px' }" class="split-panel" :class="{ resizing: isDragging }">
            <slot name="left">
            </slot>
        </div>
        <div class="split-divider" @mousedown="onMouseDown"></div>
        <!-- Right panel -->
        <div class="split-panel right" :class="{ resizing: isDragging }">
            <slot name="right">
            </slot>
        </div>


    </div>
</template>
<script lang="ts" setup>
import { ref, onBeforeUnmount } from 'vue'

const props = defineProps({
    leftWidth : {
        type: Number,
        default: 128
    },
    leftMinWidth: {
        type: Number,
        default: 128
    },
    leftMaxWidth: {
        type: Number,
        default: 256
    }
})


const leftPanelWidth = ref(props.leftWidth)
const isDragging = ref(false)

const onMouseDown = (event: MouseEvent) => {
    const startX = event.clientX
    const startWidth = leftPanelWidth.value

    const onMouseMove = (event: MouseEvent) => {
        const moveX = event.clientX - startX
        leftPanelWidth.value = startWidth + moveX

        if (leftPanelWidth.value < props.leftMinWidth) {
            leftPanelWidth.value = props.leftMinWidth
        } else if (leftPanelWidth.value > props.leftMaxWidth) {
            leftPanelWidth.value = props.leftMaxWidth
        }
    }

    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)

        isDragging.value = false
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    isDragging.value = true
}



</script>
<style lang="scss" scoped>
.split-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
}


.split-panel {
    &.resizing {
        cursor: col-resize;
    }

    &.right {
        flex-grow: 1;
    }
}

.split-divider {
    height: 100%;
    width: 3px;
    background-color: rgb(44, 44, 44);
    cursor: col-resize;

    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 4px;
        transition: all 0.2s ease-in-out;
    }

    // Hover change before color
    &:hover {
        &::before {
            background-color: rgb(172, 170, 170);
        }
    }
}
</style>