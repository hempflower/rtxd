<template>
    <div>
        __label__(noCase)
    </div>
</template>
<script setup lang="ts">
import { ref, inject, Ref } from 'vue'

const foo = inject('foo') as Ref<string>
</script>