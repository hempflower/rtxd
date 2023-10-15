<template>
  <div>
    <div class="field">
      <el-input
        v-model="splitter"
        autosize
        resize="none"
        type="textarea"
        placeholder="输入一个分隔符"
      />
    </div>
    <div class="field">
      <el-switch
        v-model="keepSplitter"
        active-text="保留分割符"
        inactive-text="移除分割符"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, inject, Ref } from "vue";

const splitter = inject("splitter") as Ref<string>;
const keepSplitter = inject("keepSplitter") as Ref<boolean>;


</script>
