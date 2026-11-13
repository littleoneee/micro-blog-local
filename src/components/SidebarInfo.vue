<script setup>
import { usePostsStore } from "../stores/posts.js";

const posts = usePostsStore();
</script>

<template>
  <aside class="sidebar sidebar--left" aria-label="站点信息">
    <section class="card side-card">
      <h2 class="side-card__title">关于轻语</h2>
      <p class="side-card__text">
        一个只存在你浏览器里的短内容角落。无需注册，无需联网，写下就留在这里。
      </p>
    </section>

    <section class="card side-card">
      <h2 class="side-card__title">本地内容</h2>
      <p class="stat">
        <span id="total-count" class="stat__num">{{ posts.total }}</span>
        <span class="stat__unit">条</span>
      </p>
      <p class="side-card__hint">存储于浏览器 localStorage</p>
    </section>

    <section class="card side-card">
      <h2 class="side-card__title">小提示</h2>
      <ul class="tips">
        <li><kbd>Ctrl</kbd><span>/</span><kbd>⌘</kbd><span>+</span><kbd>Enter</kbd><span>快速发布</span></li>
        <li>单条内容上限 280 字</li>
        <li>清除浏览器数据会一并清空</li>
      </ul>
    </section>
  </aside>
</template>
