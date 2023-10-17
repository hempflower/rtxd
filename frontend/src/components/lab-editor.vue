<template>
  <div class="lab-editor-container full-height">
    <editor-background class="editor-bg"></editor-background>
    <div
      class="editor-container"
      ref="editorContainer"
      :class="{ 'editor-zoom-animation': zooming }"
    ></div>
    <!-- Toolbar -->
    <div class="lab-editor-toolbar">
      <el-button-group>
        <el-tooltip
          content="自动调整缩放"
          placement="top"
          :enterable="false"
          :auto-close="1000"
        >
          <el-button plain :icon="FullScreen" @click="autoZoom" />
        </el-tooltip>
        <el-tooltip
          content="停止运行"
          placement="top"
          :enterable="false"
          :auto-close="1000"
        >
          <el-button
            plain
            :icon="VideoPause"
            :disabled="!running"
            @click="stop"
          />
        </el-tooltip>
        <el-tooltip
          content="开始运行"
          placement="top"
          :enterable="false"
          :auto-close="1000"
        >
          <el-button
            plain
            :icon="VideoPlay"
            :disabled="running"
            @click="start"
          />
        </el-tooltip>
      </el-button-group>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { LabEditor } from "@/editor/editor";
import { useDocument } from "@/composables/doc";
import { useEditAction } from "@/composables/edit-action";
import EditorBackground from "@/components/editor-background.vue";
import { FullScreen, VideoPause, VideoPlay } from "@element-plus/icons-vue";
import { useLogger } from "@/composables/logger";

const editorContainer = ref<HTMLElement | null>(null);
let editorInstance: LabEditor | null = null;

const zooming = ref(false);

const running = ref(false);

const { content, onLoadContent } = useDocument();
const { undoFn, redoFn, deleteFn, cloneFn } = useEditAction();
const { info } = useLogger("node-editor");

const createEditorInstance = async () => {
  info("create editor instance");
  const container = editorContainer.value as HTMLElement;
  editorInstance = new LabEditor(container);

  undoFn.value = () => editorInstance?.undo();
  redoFn.value = () => editorInstance?.redo();
  deleteFn.value = () => editorInstance?.removeSelectedNodes();
  cloneFn.value = () => editorInstance?.cloneSelectedNodes();

  onLoadContent(() => {
    info("load project json");
    editorInstance?.loadJson(content.value);
  });

  editorInstance.onContentChange((json) => {
    info("editor content change. Sync to document");
    content.value = json;
  });

  watch(editorInstance.isRunning, (val) => {
    info("editor running state change:" + val);
    running.value = val;
  });
};

onMounted(async () => {
  await createEditorInstance();
});

onBeforeUnmount(() => {
  info("destroy editor instance");
  editorInstance?.destroy();

  editorInstance = null;
  undoFn.value = null;
  redoFn.value = null;
  deleteFn.value = null;
  cloneFn.value = null;
});

const autoZoom = () => {
  zooming.value = true;
  editorInstance?.autoZoom();
  setTimeout(() => {
    zooming.value = false;
  }, 200);
};

const stop = () => {
  editorInstance?.stop();
};

const start = () => {
  editorInstance?.start();
};
</script>
<style lang="scss">
.lab-editor-container {
  background-color: #1f1f1f;

  .editor-container {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }

  .editor-zoom-animation > div {
    transition: transform 0.2s ease-in-out;
  }

  .lab-editor-toolbar {
    display: flex;

    // float center
    position: absolute;
    top: 32px;
    left: 50%;
    transform: translateX(-50%);

    border-radius: 4px;
    background-color: #1f1f1f;
  }
}

.editor-bg {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  opacity: 0.1;
}
</style>
