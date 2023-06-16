<template>
    <div style="text-align: center;">
        触发 {{  count  }} 次
    </div>
</template>
<script setup lang="ts">
import { inject, ref } from 'vue'

const count = inject('count', ref(0))


</script>