<template>
  <div ref="workarea" class="lab-workarea">
    <LabEditor class="full-height"></LabEditor>
  </div>
</template>
<script lang="ts" setup>
import LabEditor from "@/components/LabEditor.vue";
</script>

<style lang="scss">
.lab-workarea {
  height: 100%;
  width: 100%;
  position: relative;

  .el-tabs__nav-wrap {
    padding: 0;
  }

  .el-tabs__content {
    height: calc(100% - 56px);
  }

  .lab-editor {
    height: 100%;
  }
}
</style>
