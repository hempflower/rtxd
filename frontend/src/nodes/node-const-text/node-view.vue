<template>
  <div class="node-const-text-container">
    <el-input
      type="textarea"
      v-model="inputVal"
      placeholder="请输入文本"
      resize="none"
      rows="5"
      show-word-limit
      @change="onInput"
    />
  </div>
</template>
<script setup lang="ts">
import { inject, Ref } from "vue";

const inputVal = inject("value") as Ref<string>;

const onInput = (val: string) => {
  inputVal.value = val;
};
</script>
<style>
.node-const-text-container {
    width: 300px;
}
</style>