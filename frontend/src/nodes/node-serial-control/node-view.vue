<template>
  <div class="serial-control-node-container">
    <div class="serial-control-form-item">
      <div class="input-label">端口</div>
      <el-select
        :teleported="false"
        :persistent="false"
        class="input-width"
        v-model="serialOptions.path"
        :disabled="isConnect"
        placeholder="端口"
      >
        <el-option
          v-for="item in serialPorts"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
    </div>
    <div class="lab-side-form-item">
      <div class="input-label">波特率</div>
      <el-autocomplete
        :teleported="false"
        class="input-width"
        v-model="serialOptions.baudRate"
        :disabled="isConnect"
        :fetch-suggestions="fetchPresetsBaudRate"
        placeholder="波特率"
      />
    </div>
    <div class="lab-side-form-item">
      <div class="input-label">停止位</div>
      <el-select
        :teleported="false"
        class="input-width"
        v-model="serialOptions.stopBits"
        :disabled="isConnect"
        placeholder="停止位"
      >
        <el-option label="1" :value="0" />
        <el-option label="1.5" :value="1" />
        <el-option label="2" :value="2" />
      </el-select>
    </div>
    <div class="lab-side-form-item">
      <div class="input-label">数据位</div>
      <el-select
        :teleported="false"
        class="input-width"
        v-model="serialOptions.dataBits"
        :disabled="isConnect"
        placeholder="数据位"
      >
        <el-option label="8" :value="8" />
        <el-option label="7" :value="7" />
        <el-option label="6" :value="6" />
        <el-option label="5" :value="5" />
      </el-select>
    </div>
    <div class="lab-side-form-item">
      <div class="input-label">检验位</div>
      <el-select
        :teleported="false"
        class="input-width"
        v-model="serialOptions.parity"
        :disabled="isConnect"
        placeholder="校验位"
      >
        <el-option label="无" value="none" />
        <el-option label="偶校验" value="even" />
        <el-option label="奇校验" value="odd" />
        <el-option label="标记" value="mark" />
        <el-option label="空格" value="space" />
      </el-select>
    </div>
    <div class="actions">
      <el-button
        v-if="!isConnect"
        class="input-width"
        type="primary"
        @click="onOpenSerial"
        >连 接</el-button
      >
      <el-button
        v-if="isConnect"
        class="input-width"
        type="danger"
        @click="onCloseSerial"
        >断 开</el-button
      >
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, inject, Ref } from "vue";
import { SerialOptionsWithPath, useSerialList } from "@/composables/serial";

const { serialPorts } = useSerialList();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetchPresetsBaudRate = (query: string, cb: any) => {
  const commonBaudRate = [
    9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600,
  ];

  const matchedBaudRate = query
    ? commonBaudRate.filter((item) => item.toString().startsWith(query))
    : commonBaudRate;
  cb(matchedBaudRate.map((item) => ({ value: item, label: item })));
};

const isConnect = inject("isConnect", ref(false));
const onOpenSerial = inject<Ref<() => void>>("onOpenSerial");
const onCloseSerial = inject<Ref<() => void>>("onCloseSerial");
const serialOptions = inject<Ref<SerialOptionsWithPath>>(
  "serialOptions",
  ref({
    path: "",
    baudRate: 115200,
    stopBits: 0,
    dataBits: 8,
    parity: "none",
  })
);
</script>
<style lang="scss">
.serial-control-node-container {
  .input-label {
    font-size: 10px;
    color: rgb(143, 143, 143);
    font-weight: bold;
    margin-bottom: 4px;
  }

  .input-width {
    width: 100% !important;
  }

  .actions {
    width: 100%;
    margin-top: 16px;
  }
}
</style>
