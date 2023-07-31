<template>
    <div class="full-height-container">
        <menu-bar :menu="menuList"></menu-bar>
        <div class="workspace-container">
            <div class="full-height-container">
                <work-area></work-area>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
// Components
import MenuBar from '@/components/menu-bar.vue'
import WorkArea from '@/components/work-area.vue';

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
