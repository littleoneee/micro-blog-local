import { defineStore } from "pinia";
import { AUTH, STORAGE_KEYS } from "../constants/index.js";
import { createStorage } from "../services/storage.js";

const storage = createStorage();

function failure(message) {
  return { ok: false, message, persisted: false };
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    session: null
  }),

  getters: {
    isAuthed: (state) => Boolean(state.session),
    username: (state) => (state.session ? state.session.username : null)
  },

  actions: {
    /**
     * 从本地存储恢复会话，非法数据会被清除
     * @returns {boolean} 是否恢复成功
     */
    restore() {
      const data = storage.readJSON(STORAGE_KEYS.session);
      const loginAt = data ? Number(data.loginAt) : Number.NaN;

      if (
        !data ||
        typeof data !== "object" ||
        data.username !== AUTH.username ||
        !Number.isFinite(loginAt)
      ) {
        this.session = null;
        storage.remove(STORAGE_KEYS.session);
        return false;
      }

      this.session = { username: data.username, loginAt };
      return true;
    },

    /**
     * 校验凭据并登录
     * @param {string} username
     * @param {string} password
     * @returns {{ ok: boolean, message: string, persisted: boolean }}
     */
    login(username, password) {
      const name = (username || "").trim();

      if (!name || !password) {
        return failure("请输入账号和密码");
      }

      if (name !== AUTH.username || password !== AUTH.password) {
        return failure("账号或密码错误，请重新输入");
      }

      this.session = { username: AUTH.username, loginAt: Date.now() };
      const persisted = storage.writeJSON(STORAGE_KEYS.session, this.session);

      return { ok: true, message: "", persisted };
    },

    /** 退出登录：仅清除会话，不影响已发布内容 */
    logout() {
      this.session = null;
      storage.remove(STORAGE_KEYS.session);
    }
  }
});
