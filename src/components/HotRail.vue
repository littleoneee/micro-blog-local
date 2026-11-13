<script setup>
import { GALLERY_PHOTOS, HOT_TOPICS } from "../constants/index.js";
import GalleryGrid from "./GalleryGrid.vue";
import HotTopicItem from "./HotTopicItem.vue";

const emit = defineEmits(["pick"]);
</script>

<template>
  <aside class="hot-rail" aria-label="热点与图集">
    <section class="card hot-card" aria-labelledby="hot-title">
      <div class="hot-card__head">
        <h2 id="hot-title" class="hot-card__title">
          <span class="hot-card__flame" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12.4 2.6c.3 3.3-.6 5.6-2.3 7.1-.9.8-1.9 1.4-2.8 2.2-1.4 1.2-2.3 2.8-2.3 4.7a6.9 6.9 0 0 0 13.8 0c0-3.5-2-6.2-4.2-8.1.2 1.7-.3 2.9-1.2 3.5-.2-3.4-.2-6.4-1-9.4Z"
              />
            </svg>
          </span>
          正在发生
        </h2>
        <span class="live"><span class="live__dot" aria-hidden="true"></span>实时</span>
      </div>

      <ol id="hot-list" class="hot-list">
        <HotTopicItem
          v-for="topic in HOT_TOPICS"
          :key="topic.id"
          :topic="topic"
          @pick="emit('pick', $event)"
        />
      </ol>

      <p class="hot-card__note">示例热点 · 图片来自 Unsplash</p>
    </section>

    <section class="card hot-card hot-card--gallery" aria-labelledby="gallery-title">
      <div class="hot-card__head">
        <h2 id="gallery-title" class="hot-card__title">精选瞬间</h2>
        <span class="hot-card__sub">光影记录</span>
      </div>
      <GalleryGrid :photos="GALLERY_PHOTOS" />
    </section>
  </aside>
</template>
