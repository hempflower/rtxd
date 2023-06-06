<template>
    <div class="full-height-container">
        <MenuBar :menu="menuList"></MenuBar>


        <div class="workspace-container">
            <SplitPanel :left-min-width="200" :left-max-width="300" :left-width="256">
                <template #left>
                    <div class="full-height-container">
                        <SidePanel></SidePanel>
                    </div>
                </template>
                <template #right>
                    <div class="full-height-container">
                        <WorkArea></WorkArea>
                    </div>
                </template>
            </SplitPanel>
        </div>

    </div>
</template>

<script lang="ts" setup>
// Components
import MenuBar from '@/components/MenuBar.vue'
import SplitPanel from '@/components/SplitPanel.vue'
import SidePanel from '@/components/SidePanel.vue'
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
