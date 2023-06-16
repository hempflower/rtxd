<template>
    <el-tabs v-model="activeName" class="side-tabs full-height">
        <el-tab-pane class="tab-panel-fit" label="连接" name="connect">
            <ConnectPanel></ConnectPanel>
        </el-tab-pane>
        <el-tab-pane class="tab-panel-fit" label="通道" name="channel">
            <ChannelPanel></ChannelPanel>
        </el-tab-pane>
    </el-tabs>
</template>
<script lang="ts" setup>
import { ref } from 'vue'

import ConnectPanel from '@/components/SidePanel/ConnectPanel.vue'
import ChannelPanel from '@/components/SidePanel/ChannelPanel.vue'

const activeName = ref('connect')
</script>
<style lang="scss">
.side-tabs {
    .el-tabs__nav-wrap {
        padding: 0 16px;
    }

    .el-tabs__content {
        height: calc(100% - 55px);
    }
    .tab-panel-fit {
        height: 100%;
    }
}
</style>
<style lang="scss" scoped></style>
