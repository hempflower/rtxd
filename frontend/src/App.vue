<template>
  <router-view></router-view>  
  <DevWatermark v-if="isDev" />
</template>
<script setup lang="ts"> 
import DevWatermark from './components/DevWatermark.vue';
import { ref } from 'vue';

const isDev = ref(import.meta.env.DEV);

</script>