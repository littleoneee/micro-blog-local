<script setup>
import { nextTick, ref } from "vue";
import { useAuthStore } from "./stores/auth.js";
import LoginView from "./components/LoginView.vue";
import AppHeader from "./components/AppHeader.vue";
import SidebarInfo from "./components/SidebarInfo.vue";
import ComposerCard from "./components/ComposerCard.vue";
import FeedList from "./components/FeedList.vue";
import HotRail from "./components/HotRail.vue";

const auth = useAuthStore();
const composerRef = ref(null);

function handleLogout() {
  auth.logout();
}

function handleLoginSuccess() {
  nextTick(() => {
    if (composerRef.value) composerRef.value.focus();
  });
}

function handlePick(topic) {
  if (composerRef.value) composerRef.value.applyTopic(topic);
}
</script>

<template>
  <LoginView v-if="!auth.isAuthed" @success="handleLoginSuccess" />

  <div v-else class="app">
    <AppHeader @logout="handleLogout" />

    <main class="layout">
      <SidebarInfo />

      <section class="feed-col" aria-label="发布与时间线">
        <div class="mobile-hint">
          <span>仅存于此设备</span>
          <span class="mobile-hint__dot" aria-hidden="true">·</span>
          <span>Ctrl / ⌘ + Enter 发布</span>
        </div>

        <ComposerCard ref="composerRef" />
        <FeedList />
      </section>

      <HotRail @pick="handlePick" />
    </main>

    <footer class="foot">
      内容与登录状态仅保存在本机浏览器，清除站点数据后无法恢复；热点为示例内容，配图来自 Unsplash。
    </footer>
  </div>
</template>
