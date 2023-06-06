<template>
    <el-tabs v-model="activeName" class="side-tabs">
        <el-tab-pane label="连接" name="connect">
            <ConnectPanel></ConnectPanel>
        </el-tab-pane>
        <el-tab-pane label="通道" name="channel">Config</el-tab-pane>
    </el-tabs>
</template>
<script lang="ts" setup>
import { ref } from 'vue'

import ConnectPanel from '@/components/SidePanel/ConnectPanel.vue'

const activeName = ref('connect')
</script>
<style lang="scss">
.el-tabs__nav-wrap {
    padding: 0 16px;
}
</style>
<style lang="scss" scoped>
</style>
