<script setup>
import { computed, ref } from "vue";
import { unsplashUrl } from "../utils/image.js";

const props = defineProps({
  photos: { type: Array, required: true }
});

const broken = ref([]);

const items = computed(() =>
  props.photos.map((photo, index) => ({
    ...photo,
    isLead: index === 0,
    src: unsplashUrl(photo.image, index === 0 ? 640 : 320, index === 0 ? 400 : 320),
    initial: Array.from(photo.caption || "")[0] || "影"
  }))
);

function markBroken(index) {
  broken.value[index] = true;
}
</script>

<template>
  <div id="gallery" class="gallery">
    <figure
      v-for="(photo, index) in items"
      :key="photo.image"
      class="gallery__item"
      :class="{ 'gallery__item--lead': photo.isLead }"
    >
      <div
        class="gallery__frame"
        :class="{ 'is-fallback': broken[index] }"
        :data-initial="photo.initial"
      >
        <img
          v-if="!broken[index]"
          :src="photo.src"
          :alt="photo.alt"
          loading="lazy"
          decoding="async"
          @error="markBroken(index)"
        />
        <figcaption class="gallery__caption">{{ photo.caption }}</figcaption>
      </div>
    </figure>
  </div>
</template>
