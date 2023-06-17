<template>
    <div>
        <div class="control-title">定时触发周期</div>
        <el-input-number v-model="timeout" :min="1" :max="100000" @change="(cur) => cur && updateTimeout?.(cur)"/>
    </div>
</template>

<script setup lang="ts">
import { ref,inject } from 'vue'
import type { Ref } from 'vue'

const timeout = inject<Ref<number>>('timeout')
const updateTimeout = inject<(timeout:number) => void>('updateTimeout')

</script>
<style lang="scss" scoped>
.control-title {
    font-size: 12px;
    color: #fff;
    margin-bottom: 5px;
}
</style>