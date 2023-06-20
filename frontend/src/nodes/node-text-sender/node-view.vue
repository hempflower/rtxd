<template>
    <div class="node-text-sender-container">
        <div class="field">
            <el-input v-model="inputText" autosize resize="none" type="textarea" @keydown="handleKeyDown"
                :placeholder="placeholder" />
        </div>
        <div class="field">
            <el-switch v-model="enterSend" active-text="回车发送" inactive-text="回车换行" />
        </div>
        <div class="field">
            <el-switch v-model="appendLine" active-text="追加换行" inactive-text="不追加换行" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, inject, watch } from 'vue'

const inputText = inject('inputText', ref(''))
const sendText = inject('sendText', () => undefined)
const updateNodeConnection = inject('updateNodeConnection', () => undefined)


const enterSend = ref(false)
const appendLine = inject('appendLine', ref(false))

const placeholder = ref('请输入内容, 回车换行')

watch(
    () => enterSend,
    (val) => {
        placeholder.value = val ? '请输入内容, \'Shift + 回车\'换行' : '请输入内容，\'回车\'换行'
    },
)

watch(
    () => inputText,
    () => {
        updateNodeConnection()
    },
)

const handleKeyDown = (e: KeyboardEvent | Event) => {
    setTimeout(() => {
        updateNodeConnection()
    }, 0)
    if (!(e instanceof KeyboardEvent)) return;
    if (e.key === 'Enter') {

        if (enterSend.value) {
            if (!e.shiftKey) {
                sendText()
                e.preventDefault()
            }
        } else {
            if (e.shiftKey) {
                sendText()
                e.preventDefault()
            }
        }
    }
}


</script>
<style scoped lang="scss">
.node-text-sender-container {
    width: 300px;
    .field {
        margin-bottom: 4px;
    }
}
</style>
