import { defineStore } from "pinia";
import { AUTH, LIMITS, STORAGE_KEYS } from "../constants/index.js";
import { createStorage } from "../services/storage.js";
import { clipText, countChars, createId } from "../utils/text.js";

const storage = createStorage();

function normalizePost(raw) {
  if (!raw || typeof raw !== "object") return null;

  const content = typeof raw.content === "string" ? raw.content : "";
  if (!content.trim()) return null;

  const createdAt = Number(raw.createdAt);

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : createId(),
    author:
      typeof raw.author === "string" && raw.author.trim()
        ? clipText(raw.author.trim(), LIMITS.author)
        : AUTH.username,
    content,
    createdAt: Number.isFinite(createdAt) ? createdAt : Date.now()
  };
}

export const usePostsStore = defineStore("posts", {
  state: () => ({
    posts: []
  }),

  getters: {
    total: (state) => state.posts.length
  },

  actions: {
    /** 从本地存储加载内容：过滤脏数据并按时间倒序 */
    load() {
      const data = storage.readJSON(STORAGE_KEYS.posts);
      if (!Array.isArray(data)) {
        this.posts = [];
        return;
      }

      this.posts = data
        .map(normalizePost)
        .filter(Boolean)
        .sort((a, b) => b.createdAt - a.createdAt);
    },

    /**
     * 校验并发布一条内容
     * @param {{ content: string, author: string }} payload
     * @returns {{ ok: boolean, message: string, persisted: boolean, post?: object }}
     */
    publish(payload) {
      const rawContent = payload && typeof payload.content === "string" ? payload.content : "";
      const content = rawContent.replace(/\r\n?/g, "\n");

      if (!content.trim()) {
        return { ok: false, message: "写点什么再发布吧", persisted: false };
      }

      if (countChars(content) > LIMITS.content) {
        return {
          ok: false,
          message: `内容超过 ${LIMITS.content} 字，请精简后再发布`,
          persisted: false
        };
      }

      const rawAuthor = payload && typeof payload.author === "string" ? payload.author : "";
      const post = {
        id: createId(),
        author: clipText(rawAuthor.trim() || AUTH.username, LIMITS.author),
        content,
        createdAt: Date.now()
      };

      this.posts.unshift(post);
      const persisted = storage.writeJSON(STORAGE_KEYS.posts, this.posts);

      return { ok: true, message: "发布成功", persisted, post };
    }
  }
});
