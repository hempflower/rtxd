<template>
    <div class="full-height-container">
        <MenuBar :menu="menuList"></MenuBar>
        <div class="workspace-container">
            <div class="full-height-container">
                <WorkArea></WorkArea>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
// Components
import MenuBar from '@/components/MenuBar.vue'
import WorkArea from '@/components/WorkArea.vue';

// Composables
import useMenu from '@/composables/menu';


const { menuList } = useMenu();


</script>
<style lang="scss" scoped>
.full-height-container {
    height: 100%;
    width: 100%;
}

.workspace-container {
    height: calc(100% - 34px);
    width: 100%;
}
</style>
