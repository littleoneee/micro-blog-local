<script setup>
import { computed } from "vue";
import { formatRelativeTime } from "../utils/time.js";
import { initialOf } from "../utils/text.js";

const props = defineProps({
  post: { type: Object, required: true },
  now: { type: Number, default: () => Date.now() }
});

const time = computed(() => formatRelativeTime(props.post.createdAt, props.now));
const initial = computed(() => initialOf(props.post.author));
</script>

<template>
  <li class="post">
    <span class="avatar" aria-hidden="true">{{ initial }}</span>
    <div class="post__body">
      <div class="post__head">
        <span class="post__author">{{ post.author }}</span>
        <time class="post__time" :datetime="new Date(post.createdAt).toISOString()">{{ time }}</time>
      </div>
      <p class="post__content">{{ post.content }}</p>
    </div>
  </li>
</template>
