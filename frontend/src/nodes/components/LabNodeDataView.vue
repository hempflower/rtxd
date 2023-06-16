<template>
    <div style="text-align: center;">
        {{  value  }}
    </div>
</template>
<script setup lang="ts">
import { inject, ref } from 'vue'

const value = inject('dataText', ref(""))
</script>