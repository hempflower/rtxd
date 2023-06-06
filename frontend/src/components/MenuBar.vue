<template>
    <div class="menu-bar-container">
        <el-popover v-for="(item, index) in porps.menu" :key="item.title" :visible="menuVisibles[index]" trigger="click"
            :show-arrow="false" :width="200" popper-class="lab-menu-popover" placement="bottom-start">
            <template #reference>
                <span class="lab-menu-item" @click="onClickMenu(index)" v-click-outside="onClickOutside">
                    {{ item.title }}
                </span>
            </template>
            <ul class="lab-menu-list">
                <template v-for="menuItem in item.items" :key="menuItem.title">
                    <template v-if="menuItem.title === '---'">
                        <div class="lab-menu-item-divider"></div>
                    </template>
                    <template v-else>
                        <li class="lab-menu-item-link" @click="menuItem.action">
                            {{ menuItem.title }}
                        </li>
                    </template>
                </template>
            </ul>
        </el-popover>
    </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import { ref } from 'vue'
import { ClickOutside as vClickOutside } from 'element-plus'


interface MenuItem {
    title: string,
    action?: () => void
}

interface Menu {
    title: string,
    items: MenuItem[]
}

const menuVisibles = ref<boolean[]>([])

const porps = defineProps({
    menu: {
        type: Array as PropType<Menu[]>,
        default: () => []
    }
})

porps.menu.forEach(() => {
    menuVisibles.value.push(false)
})

const onClickMenu = (menuIndex: number) => {
    // Close all popover
    menuVisibles.value.forEach((_, index) => {
        menuVisibles.value[index] = false
    })
    // Open popover
    menuVisibles.value[menuIndex] = true
}


const onClickOutside = () => {
    // Close all popover
    menuVisibles.value.forEach((_, index) => {
        menuVisibles.value[index] = false
    })
}

</script>

<style lang="scss">
.lab-menu-popover {
    padding: 0 !important;
}
</style>

<style lang="scss" scoped>
.menu-bar-container {
    display: flex;
    height: 32px;

    // bottom border
    border-bottom: 2px solid rgb(44, 44, 44);
}

.lab-menu-item {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 12px;
    cursor: pointer;
    color: rgb(180, 180, 180);
    // No focus outline
    outline: none;

    font-size: 14px;

    &:hover {
        background-color: rgb(40, 40, 40);
        color: #fff;
    }
}

.lab-menu-item-link {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 4px 12px;
    cursor: pointer;
    color: rgb(180, 180, 180);
    // No focus outline
    outline: none;

    font-size: 14px;

    &:hover {
        background-color: rgb(60 60 60);
        color: #fff;
    }
}

.lab-menu-item-divider {
    height: 1px;
    width: 100%;
    margin: 4px 0;
    background-color: rgb(82, 82, 82);
}


.lab-menu-list {
    padding: 4px 0;
    margin: 0;
    list-style: none;
    font-size: 14px;
    color: rgb(180, 180, 180);
    background-color: rgb(40, 40, 40);
    border-radius: 2px;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
    // No focus outline
    outline: none;
}
</style>