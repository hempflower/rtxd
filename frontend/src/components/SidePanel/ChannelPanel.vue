<template>
    <div class="lab-side-container">
        <div class="lab-side-title">通道列表</div>
    </div>
    <div>
        <el-table :data="tableData" style="width: 100%" :empty-text="noChannelText">
            <el-table-column prop="id" label="ID" width="64">
                <template #default="scope">
                    <!-- Copy on click -->
                    <el-tooltip content="点击复制" placement="right">
                        <span class="copy-cursor" @click="copy(scope.row.id)">
                            {{ scope.row.id }}
                        </span>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="name" label="名称">
                <template #default="scope">
                    <el-tooltip content="点击复制" placement="right">
                        <span class="copy-cursor" @click="copy(scope.row.name)">
                            {{ scope.row.name }}
                        </span>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="flags" label="属性" width="72px">
                <template #default="scope">
                    <div>
                        {{ toFlags(scope.row.flags).join(' | ') }}
                    </div>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>
<style lang="scss" src="./style.scss" />
<script lang="ts" setup>
import { ref,computed } from 'vue'
// @ts-ignore
import { copyText } from 'vue3-clipboard'

import { useChannels } from '@/composables/lab'

const { channels } = useChannels();

const tableData = computed(() => {
    return channels.value.map((channel) => {
        return {
            id: channel.id,
            name: channel.name,
            flags: channel.flags.toString(),
        };
    });
});

const FLAG_READ = 1 << 0;
const FLAG_WRITE = 1 << 1;

const copy = (val: string) => {
    copyText(val,undefined,() => 0)
}

const toFlags = (val: number) => {
    const flags = [];
    if (val & FLAG_READ) {
        flags.push('读');
    }
    if (val & FLAG_WRITE) {
        flags.push('写');
    }

    return flags;
}




const noChannelText = ref('暂无通道');
</script>
<style lang="scss">
.copy-cursor {
    cursor: pointer;
    user-select: all;
}
</style>