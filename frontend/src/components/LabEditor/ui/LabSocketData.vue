<template>
    <div class="socket"></div>
</template>
<script lang="ts" setup>

const props = defineProps(['data'])

</script>
<style lang="scss" scoped>
@import "@/vars.scss";
.socket {
    height: $socket-size;
    width: $socket-size;

    border: 3px solid $node-line-color;
    border-radius: 50%;

    background-color: darken($node-line-color, 40%);

    margin: 0 4px;
}

</style>