import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { useAuthStore } from "./stores/auth.js";
import { usePostsStore } from "./stores/posts.js";
import "./assets/styles.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

/* 挂载前恢复会话与内容，避免首帧视图闪烁 */
useAuthStore(pinia).restore();
usePostsStore(pinia).load();

app.mount("#app");
