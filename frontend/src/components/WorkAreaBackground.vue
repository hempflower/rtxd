<template>
    <div class="workspace-background">
        <div>
            <div class="workspace-background-content">
                <el-icon :size="72" :color="'gray'">
                    <Files />
                </el-icon>
            </div>
            <div class="workspace-background-title">Param Lab</div>
        </div>
    </div>
</template>
<style lang="scss">
.workspace-background {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    .workspace-background-content {
        display: flex;
        text-align: center;
        justify-content: center;
    }

    .workspace-background-title {
        text-align: center;
        color: gray;

        font-size: 32px;
    }
}
</style>