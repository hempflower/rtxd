<template>
    <!-- DOM node for node's component -->
<div @pointerdown.stop @dblclick.stop ref="nodeBody"></div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'


const props = defineProps<{
    data: {
        onWillMount: (nodeBody: HTMLElement) => void
        onWillUnmount: () => void
    }
}>()

const nodeBody = ref<HTMLElement | null>(null)

onMounted(() => {
    const emitFn = props.data.onWillMount
    emitFn(nodeBody.value as HTMLElement)
})

onBeforeUnmount(() => {
    const emitFn = props.data.onWillUnmount
    emitFn()
})

</script>