<template>
    <div class="flex justify-center">
        <el-button @click="onClickFn" @dblclick="onDbClickFn">
            <el-icon>
                <el-icon><Promotion /></el-icon>
            </el-icon>
        </el-button>
    </div>
</template>
<script setup lang="ts">
import { Promotion } from '@element-plus/icons-vue'
import { inject } from 'vue'

const onClickFn = inject('onClickFn') as () => void;
const onDbClickFn = inject('onDbClickFn') as () => void;

</script>