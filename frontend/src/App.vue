<template>
  <router-view></router-view>  
  <dev-watermark v-if="isDev" />
</template>
<script setup lang="ts"> 
import DevWatermark from './components/dev-watermark.vue';
import { ref } from 'vue';
import { useTitle } from './composables/title';

const isDev = ref(import.meta.env.DEV);
useTitle();

</script>