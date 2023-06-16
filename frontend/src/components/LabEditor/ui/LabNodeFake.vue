<template>
    <div @pointerdown.stop @dblclick.stop>
        <div @click="increment">
            Fake Node for testing
            <div @click="increment">
                {{ count }}
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
const count = ref(2)
const increment = () => {
    console.log('increment')
    count.value++
}

</script>