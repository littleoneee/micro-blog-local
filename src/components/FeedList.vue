<script setup>
import { usePostsStore } from "../stores/posts.js";
import { useRelativeNow } from "../composables/useRelativeNow.js";
import PostCard from "./PostCard.vue";

const posts = usePostsStore();
const now = useRelativeNow();
</script>

<template>
  <div class="feed-head">
    <h2 class="feed-head__title">时间线</h2>
    <span id="feed-count" class="feed-head__count">{{ posts.total }} 条</span>
  </div>

  <ul v-show="posts.total > 0" id="feed" class="feed">
    <PostCard v-for="post in posts.posts" :key="post.id" :post="post" :now="now" />
  </ul>

  <div v-if="posts.total === 0" id="empty-state" class="empty">
    <span class="empty__icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M20.5 12.2a8.5 8.5 0 0 1-12.3 7.6L3.5 21l1.3-4.4A8.5 8.5 0 1 1 20.5 12.2Z" />
        <path d="M8.5 11h7M8.5 14.5h4.5" />
      </svg>
    </span>
    <p class="empty__title">还没有内容</p>
    <p class="empty__text">写下第一条，让这里有点声音</p>
  </div>
</template>
