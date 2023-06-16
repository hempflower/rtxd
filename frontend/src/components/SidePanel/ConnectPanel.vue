<template>
    <div class="lab-side-container">
        <div class="lab-side-title">连接调试设备</div>
        <div class="lab-side-form">
            <div class="lab-side-form-item">
                <div class="input-label">
                    通信接口
                </div>
                <el-select class="input-width" v-model="selectedInterface" placeholder="接口" :disabled="connectionState.connected">
                    <el-option v-for="item in interfaces" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </div>
            <div class="lab-side-form-item">
                <div class="input-label">
                    协议
                </div>
                <el-select class="input-width" v-model="selectedProtocol" placeholder="协议" :disabled="connectionState.connected">
                    <el-option v-for="item in protocols" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </div>

            <!-- Connect Button -->
            <div class="lab-side-form-item">
                <el-button v-if="!connectionState.connected" class="input-width" type="primary" @click="connect">连  接</el-button>
                <el-button v-else class="input-width" type="danger" @click="disconnect">断开连接</el-button>
            </div>
        </div>
        <el-divider></el-divider>
        <div class="lab-side-title">接口参数</div>
        <div v-show="selectedInterface === 'serial'" class="lab-side-form">
            <div class="lab-side-form-item">
                <div class="input-label">
                    端口
                </div>
                <el-select class="input-width" v-model="serialOptions.path" placeholder="端口" :disabled="connectionState.connected">
                    <el-option v-for="item in serialPorts" :key="item" :label="item" :value="item" />
                </el-select>
            </div>
            <div class="lab-side-form-item">
                <div class="input-label">
                    波特率
                </div>
                <el-autocomplete class="input-width" v-model="serialOptions.baudRate"
                    :fetch-suggestions="fetchPresetsBaudRate" placeholder="波特率" :disabled="connectionState.connected"/>
            </div>
            <div class="lab-side-form-item">
                <div class="input-label">
                    停止位
                </div>
                <el-select class="input-width" v-model="serialOptions.stopBits" placeholder="停止位" :disabled="connectionState.connected">
                    <el-option label="1" value="1" />
                    <el-option label="1.5" value="1.5" />
                    <el-option label="2" value="2" />
                </el-select>
            </div>
            <div class="lab-side-form-item">
                <div class="input-label">
                    数据位
                </div>
                <el-select class="input-width" v-model="serialOptions.dataBits" placeholder="数据位" :disabled="connectionState.connected">
                    <el-option label="8" value="8" />
                    <el-option label="7" value="7" />
                    <el-option label="6" value="6" />
                    <el-option label="5" value="5" />
                </el-select>
            </div>
            <div class="lab-side-form-item">
                <div class="input-label">
                    检验位
                </div>
                <el-select class="input-width" v-model="serialOptions.parity" placeholder="校验位" :disabled="connectionState.connected">
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
import { ref, unref, watch } from 'vue'
import { useSerialList, useSerialOptionsModel } from '@/composables/serial';
import { useLabClient,useConnectionState } from '@/composables/lab';
import { useNotify } from '@/composables/notify';

import { createSerialInterface } from '@/interface/serial';
import type { IInterface } from '@/interface/interface';
import type { IProtocol } from '@/protocol/protocol';
import { createNDProtocol } from '@/protocol/ndp';
import { createMockInterface } from '@/interface/mock';

type InterfaceType = 'serial' | 'tcp' | 'udp' | 'ws' | 'mock'
type ProtocolType = 'ndp' | 'raw'

const interfaces = [
    {
        label: '串口',
        value: 'serial'
    },
    {
        label: 'Mock',
        value: 'mock'
    }
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

const { connectionState } = useConnectionState()

watch(serialPorts, (value) => {
    if (value.length > 0) {
        serialOptions.value.path = value[0]
    } else {
        serialOptions.value.path = ''
    }
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const connect = () => {
    const { labClient } = useLabClient()
    let interfaceInstance: IInterface | null = null;
    let protocolInstance: IProtocol | null = null;

    if (unref(connectionState).connected) {
        const { notify } = useNotify()
        notify('连接状态异常','连接状态应该是[未连接]，但实际为[已连接]', 'error')
        labClient.disconnect()
        return;
    }

    // Create interface instance
    if (selectedInterface.value === 'serial') {
        interfaceInstance = createSerialInterface(serialOptions.value)
    } else if (selectedInterface.value === 'mock') {
        interfaceInstance = createMockInterface()
    }

    // Create protocol instance
    if (selectedProtocol.value === 'ndp') {
        protocolInstance = createNDProtocol()
    }

    // Check if interface and protocol is created
    if (!interfaceInstance || !protocolInstance) {
        return
    }

    labClient.useInterface(interfaceInstance)
    labClient.useProtocol(protocolInstance)

    labClient.connect()
}

const disconnect = () => {
    const { labClient } = useLabClient()
    labClient.disconnect()
}


</script>
<style lang="scss" src="./style.scss" />