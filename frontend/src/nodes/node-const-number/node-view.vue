<template>
    <div>
        <el-input type="number" v-model="inputVal" placeholder="请输入数值" @change="onInput"/>
    </div>
</template>
<script setup lang="ts">
import { inject, ref } from 'vue'

const value = inject('value', ref(0))

const inputVal = ref(value.value)

const onInput = (val: string) => {
    // check if val is a number
    if (isNaN(Number(val))) {
        inputVal.value = value.value
        return
    }

    value.value = Number(val)
}

</script>
