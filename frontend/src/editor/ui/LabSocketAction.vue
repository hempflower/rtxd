<template>
    <div class="socket"></div>
</template>
<script lang="ts" setup>

const props = defineProps(['data'])

</script>
<style lang="scss" scoped>
@import "@/vars.scss";
.socket {
    cursor: pointer;
    width: $socket-size * 2;
    height: $socket-size;
    vertical-align: middle;
    background: $node-line-color;
    z-index: 2;
    box-sizing: border-box;

    transition: all 0.2s ease-in-out;
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);

    &:hover {
        background: #5aaffa;
        box-shadow: 0 0 3px 0px #5aaffaa6;
    }
}
</style>