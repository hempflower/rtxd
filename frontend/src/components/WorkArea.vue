<template>
    <div class="lab-workarea">
        <WorkAreaBackground></WorkAreaBackground>
        <el-tabs v-model="tabValue" type="card" closable>
            <el-tab-pane v-for="item in tabs" :key="item.name" :label="item.title" :name="item.name">
                {{ item.content }}
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import WorkAreaBackground from '@/components/WorkAreaBackground.vue'

const tabValue = ref('first')

const tabs = [
    {
        title: '波形图.panel *',
        name: 'chart',
        content: '波形图'
    },
    {
        title: '运动控制.panel',
        name: 'mov-control',
        content: '运动控制'
    },
    {
        title: '平衡 PID 调整.panel',
        name: 'aaa.panel',
        content: 'Tab 2 content'
    },
]

</script>

<style lang="scss">
.lab-workarea {
    height: 100%;
    width: 100%;
    position: relative;

    .el-tabs__nav-wrap {
        padding: 0;
    }

}
</style>