<template>
  <div>
    <VueResizable
      :active="activeBorder"
      style="padding: 8px"
      :height="resizeOpts.height"
      :minHeight="resizeOpts.minHeight"
      :minWidth="resizeOpts.minWidth"
      @resize:move="updateNode"
    >
    <iframe
      :src="url"
      frameborder="0"
      style="width: 100%; height: 100%;"></iframe>
    </VueResizable>
  </div>
</template>
<script setup lang="ts">
// @ts-ignore
import VueResizable from "vue-resizable";
import { ref, inject, Ref } from "vue";

const resizeOpts = ref({
  height: 200,
  minWidth: 224,
  minHeight: 200,
});

const activeBorder = ref(["r", "rb", "b"]);


const updateNode = inject('updateNode', () => undefined)
const url = inject("url") as Ref<string>;
</script>
