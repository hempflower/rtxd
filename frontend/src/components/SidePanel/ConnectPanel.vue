<template>
    <div class="lab-connect-container">
        <div class="lab-connect-title">连接调试设备</div>
        <div class="lab-connect-form">
            <div class="lab-connect-form-item">
                <div class="input-label">
                    通信接口
                </div>
                <el-select class="input-width" v-model="selectedInterface" placeholder="接口">
                    <el-option v-for="item in interfaces" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </div>
            <div class="lab-connect-form-item">
                <div class="input-label">
                    协议
                </div>
                <el-select class="input-width" v-model="selectedProtocol" placeholder="协议">
                    <el-option v-for="item in protocols" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </div>

            <!-- Connect Button -->
            <div class="lab-connect-form-item">
                <el-button class="input-width" type="primary" color="red">断开连接</el-button>
            </div>
        </div>
        <el-divider></el-divider>
        <div class="lab-connect-title">接口参数</div>
        <div v-show="selectedInterface === 'serial'" class="lab-connect-form">
            <div class="lab-connect-form-item">
                <div class="input-label">
                    端口
                </div>
                <el-select class="input-width" v-model="serialOptions.path" placeholder="端口">
                    <el-option v-for="item in serialPorts" :key="item" :label="item" :value="item" />
                </el-select>
            </div>
            <div class="lab-connect-form-item">
                <div class="input-label">
                    波特率
                </div>
                <el-autocomplete class="input-width" v-model="serialOptions.baudRate"
                    :fetch-suggestions="fetchPresetsBaudRate" placeholder="波特率" />
            </div>
            <div class="lab-connect-form-item">
                <div class="input-label">
                    停止位
                </div>
                <el-select class="input-width" v-model="serialOptions.stopBits" placeholder="停止位">
                    <el-option label="1" value="1" />
                    <el-option label="1.5" value="1.5" />
                    <el-option label="2" value="2" />
                </el-select>
            </div>
            <div class="lab-connect-form-item">
                <div class="input-label">
                    数据位
                </div>
                <el-select class="input-width" v-model="serialOptions.dataBits" placeholder="数据位">
                    <el-option label="8" value="8" />
                    <el-option label="7" value="7" />
                    <el-option label="6" value="6" />
                    <el-option label="5" value="5" />
                </el-select>
            </div>
            <div class="lab-connect-form-item">
                <div class="input-label">
                    检验位
                </div>
                <el-select class="input-width" v-model="serialOptions.parity" placeholder="校验位">
                    <el-option label="无" value="none" />
                    <el-option label="偶校验" value="even" />
                    <el-option label="奇校验" value="odd" />
                    <el-option label="标记" value="mark" />
                    <el-option label="空格" value="space" />
                </el-select>
            </div>
        </div>

    </div>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useSerialList, useSerialOptionsModel } from '@/composables/serial';
import { useLabClient } from '@/composables/lab';

type InterfaceType = 'serial' | 'tcp' | 'udp' | 'ws'
type ProtocolType = 'ndp' | 'raw'

const interfaces = [
    {
        label: '串口',
        value: 'serial'
    },
]

const protocols = [
    {
        label: 'Nano Debug',
        value: 'ndp'
    },
    {
        label: '原始数据',
        value: 'raw'
    }
]

const selectedProtocol = ref<ProtocolType>('ndp')
const selectedInterface = ref<InterfaceType>('serial')


const { serialOptions } = useSerialOptionsModel();
const { serialPorts } = useSerialList()


watch(serialPorts, (value) => {
    if (value.length > 0) {
        serialOptions.value.path = value[0]
    } else {
        serialOptions.value.path = ''
    }
})

const fetchPresetsBaudRate = (query: string, cb: any) => {
    const commonBaudRate = [
        9600,
        19200,
        38400,
        57600,
        115200,
        230400,
        460800,
        921600,
    ]

    const matchedBaudRate = query ? commonBaudRate.filter(item => item.toString().startsWith(query)) : commonBaudRate
    cb(matchedBaudRate.map(item => ({ value: item, label: item })))
}


</script>
<style lang="scss">
.lab-connect {
    &-container {
        padding: 0 12px;
    }

    &-title {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 12px;
    }

    &-form {
        .form-label {
            font-size: 12px;
            margin-bottom: 4px;
        }

        &-item {
            margin-bottom: 8px;

            .input-width {
                width: 100% !important;
            }

            .input-label {
                font-size: 10px;
                color: rgb(143, 143, 143);
                font-weight: bold;
                margin-bottom: 4px;
            }
        }
    }
}
</style>