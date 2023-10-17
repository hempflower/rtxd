<template>
    <div class="dev-mark">
        <div class="dev-title">
            开发版本
        </div>
        <div class="dev-decsription">
            开发中的内容，可能随着开发的推进而发生变化。
        </div>
    </div>
</template>
<style lang="scss" scoped>
.dev-mark {
    position: fixed;
    bottom: 96px;
    right: 96px;
    z-index: 9999;
    opacity: 0.5;
    color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    .dev-title {
        font-size: 1.5rem;
        font-weight: bold;
    }
    .dev-decsription {
        font-size: 1rem;
    }
}
</style>