<script setup>
import { computed } from "vue";
import { useAuthStore } from "../stores/auth.js";
import { initialOf } from "../utils/text.js";

const emit = defineEmits(["logout"]);
const auth = useAuthStore();

const username = computed(() => auth.username || "");
const initial = computed(() => initialOf(username.value));
</script>

<template>
  <header class="topbar">
    <div class="topbar__inner">
      <div class="brand">
        <span class="brand__mark" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 4.5c0 8.5-6 14.5-15.5 14.5H4c0-8.5 6.5-14.5 16-14.5Z" />
            <path d="M4 20 14.5 9.5" />
          </svg>
        </span>
        <div class="brand__text">
          <span class="brand__title brand__title--sm">轻语</span>
          <span class="brand__sub brand__sub--inline">只属于本机的短内容角落</span>
        </div>
      </div>

      <div class="topbar__actions">
        <span class="chip">
          <span class="chip__dot" aria-hidden="true"></span>仅存于此设备
        </span>
        <div class="account">
          <span id="header-avatar" class="avatar avatar--sm" aria-hidden="true">{{ initial }}</span>
          <span id="header-username" class="account__name">{{ username }}</span>
          <button id="logout-btn" class="btn btn--ghost btn--sm" type="button" @click="emit('logout')">
            退出登录
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
