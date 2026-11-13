<script setup>
import { computed, nextTick, onUnmounted, ref } from "vue";
import { AUTH, LIMITS } from "../constants/index.js";
import { useAuthStore } from "../stores/auth.js";
import { usePostsStore } from "../stores/posts.js";
import { countChars, initialOf } from "../utils/text.js";

const auth = useAuthStore();
const posts = usePostsStore();

const author = ref(auth.username || AUTH.username);
const draft = ref("");
const alert = ref({ text: "", kind: "" });
const textareaEl = ref(null);
let alertTimer = null;

const charCount = computed(() => countChars(draft.value));
const overLimit = computed(() => charCount.value > LIMITS.content);
const canPublish = computed(() => Boolean(draft.value.trim()) && !overLimit.value);
const avatarInitial = computed(() => initialOf(author.value || AUTH.username));

const alertClass = computed(() =>
  ["form-alert", "form-alert--compose"]
    .concat(alert.value.kind ? [`is-${alert.value.kind}`] : [])
    .join(" ")
);

function showAlert(text, kind) {
  if (alertTimer) {
    clearTimeout(alertTimer);
    alertTimer = null;
  }
  alert.value = { text, kind };

  if (text && kind === "success") {
    alertTimer = setTimeout(() => {
      alert.value = { text: "", kind: "" };
    }, 2400);
  }
}

function publish() {
  const result = posts.publish({ content: draft.value, author: author.value });

  if (!result.ok) {
    showAlert(result.message, "error");
    if (textareaEl.value) textareaEl.value.focus();
    return;
  }

  author.value = result.post.author;
  draft.value = "";

  if (result.persisted) showAlert("发布成功", "success");
  else showAlert("内容已展示，但未能保存到本地存储", "error");
}

function handleKeydown(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    publish();
  }
}

/**
 * 把热点话题追加到正文
 * @param {{ title: string } | string} topic
 * @returns {boolean} 是否成功写入
 */
function applyTopic(topic) {
  const title = typeof topic === "string" ? topic : topic && topic.title;
  if (!title) return false;

  const tag = `#${title}# `;
  const current = draft.value;
  const next = current.trim() ? `${current.replace(/\s+$/, "")} ${tag}` : tag;

  if (countChars(next) > LIMITS.content) {
    showAlert("内容接近上限，先精简一下吧", "error");
    return false;
  }

  draft.value = next;
  nextTick(() => {
    const el = textareaEl.value;
    if (!el) return;
    el.focus();
    const end = el.value.length;
    el.setSelectionRange(end, end);
  });

  return true;
}

function focus() {
  if (textareaEl.value) textareaEl.value.focus();
}

onUnmounted(() => {
  if (alertTimer) clearTimeout(alertTimer);
});

defineExpose({ applyTopic, focus });
</script>

<template>
  <section class="card composer" aria-labelledby="composer-title">
    <h2 id="composer-title" class="sr-only">发布新内容</h2>

    <div class="composer__head">
      <span id="composer-avatar" class="avatar" aria-hidden="true">{{ avatarInitial }}</span>
      <div class="composer__meta">
        <label class="sr-only" for="composer-author">昵称</label>
        <input
          id="composer-author"
          v-model="author"
          class="composer__author"
          type="text"
          maxlength="20"
          placeholder="昵称"
          autocomplete="nickname"
        />
        <span class="composer__hint">发布后显示为你的署名</span>
      </div>
    </div>

    <label class="sr-only" for="composer-content">内容</label>
    <textarea
      id="composer-content"
      ref="textareaEl"
      v-model="draft"
      class="composer__text"
      rows="4"
      placeholder="这一刻，想说点什么？"
      @keydown="handleKeydown"
    ></textarea>

    <div class="composer__bar">
      <span class="composer__kbd">Ctrl / ⌘ + Enter 发布</span>
      <div class="composer__actions">
        <span id="counter" class="counter" :class="{ 'is-over': overLimit }">
          <span id="counter-num">{{ charCount }}</span><span class="counter__sep">/</span>280
        </span>
        <button id="publish-btn" class="btn btn--primary" type="button" :disabled="!canPublish" @click="publish">
          发布
        </button>
      </div>
    </div>

    <p :class="alertClass" id="compose-alert" role="status" aria-live="polite">
      {{ alert.text }}
    </p>
  </section>
</template>
