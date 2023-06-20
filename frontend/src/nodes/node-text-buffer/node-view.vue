<template>
    <div class="text-buffer-container" @wheel.stop>
        <VueResizable :active="activeBorder" style="padding: 8px;" :height="resizeOpts.height"
            :minHeight="resizeOpts.minHeight" :minWidth="resizeOpts.minWidth" @resize:move="updateNode">
            <el-scrollbar always ref="scroll">
                <pre>{{ textBuffer }}</pre>
            </el-scrollbar>
        </VueResizable>
    </div>
</template>
<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue'
// @ts-ignore
import VueResizable from 'vue-resizable'

import { ElScrollbar } from 'element-plus'

const textBuffer = inject('textBuffer', ref(''))
const updateNode = inject('updateNode', () => undefined)
const scrollNotify = inject('scrollNotify', ref(false))
const scroll = ref<InstanceType<typeof ElScrollbar>>()

const resizeOpts = ref({
    height: 200,
    minWidth: 224,
    minHeight: 200,
})

const activeBorder = ref([
    'r', 'rb', 'b'
])

onMounted(() => {

    watch(scrollNotify, () => {
        console.log(scroll)
        if (scroll.value && scroll.value.wrapRef) {
            scroll.value.setScrollTop(scroll.value.wrapRef?.scrollHeight)
        }
    })

})


</script>
<style lang="scss" scoped>
@import "@/vars.scss";

.text-buffer-container {
    border: 1px dashed $node-line-color;

    pre {
        white-space: pre-wrap;
        word-break: break-all;

        user-select: text;

        font-size: 18px;
        font-family: 'CascadiaMono', 'Consolas', 'Courier New', 'Courier', 'monospace';
    }
}
</style>