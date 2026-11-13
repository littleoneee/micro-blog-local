<script setup>
import { computed, ref } from "vue";
import { unsplashUrl } from "../utils/image.js";
import { initialOf } from "../utils/text.js";

const props = defineProps({
  topic: { type: Object, required: true }
});

const emit = defineEmits(["pick"]);
const broken = ref(false);

const src = computed(() => unsplashUrl(props.topic.image, 160, 160));
const initial = computed(() => initialOf(props.topic.title));
</script>

<template>
  <li class="hot-item">
    <button
      class="hot-item__btn"
      type="button"
      :aria-label="`把话题「${topic.title}」填入发布框`"
      @click="emit('pick', topic)"
    >
      <span
        class="hot-item__rank"
        :class="{ 'hot-item__rank--top': topic.rank <= 3 }"
        aria-hidden="true"
        >{{ topic.rank }}</span
      >
      <span class="hot-item__thumb" :class="{ 'is-fallback': broken }" :data-initial="initial">
        <img
          v-if="!broken"
          :src="src"
          :alt="topic.alt"
          loading="lazy"
          decoding="async"
          @error="broken = true"
        />
      </span>
      <span class="hot-item__body">
        <span class="hot-item__title">{{ topic.title }}</span>
        <span class="hot-item__meta">{{ topic.heat }} 热度 · {{ topic.tag }}</span>
      </span>
    </button>
  </li>
</template>
