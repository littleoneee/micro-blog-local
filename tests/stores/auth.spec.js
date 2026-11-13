import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "../../src/stores/auth.js";
import { AUTH, STORAGE_KEYS } from "../../src/constants/index.js";

describe("auth store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("恢复合法的本地会话", () => {
    window.localStorage.setItem(
      STORAGE_KEYS.session,
      JSON.stringify({ username: AUTH.username, loginAt: 1700000000000 })
    );

    const auth = useAuthStore();
    expect(auth.restore()).toBe(true);
    expect(auth.isAuthed).toBe(true);
    expect(auth.username).toBe(AUTH.username);
  });

  it("会话用户名不匹配时清除并保持未登录", () => {
    window.localStorage.setItem(
      STORAGE_KEYS.session,
      JSON.stringify({ username: "someone-else", loginAt: Date.now() })
    );

    const auth = useAuthStore();
    expect(auth.restore()).toBe(false);
    expect(auth.isAuthed).toBe(false);
    expect(window.localStorage.getItem(STORAGE_KEYS.session)).toBeNull();
  });

  it("会话时间戳非法时清除", () => {
    window.localStorage.setItem(
      STORAGE_KEYS.session,
      JSON.stringify({ username: AUTH.username, loginAt: "not-a-number" })
    );

    const auth = useAuthStore();
    expect(auth.restore()).toBe(false);
    expect(window.localStorage.getItem(STORAGE_KEYS.session)).toBeNull();
  });

  it("空输入提示补全账号密码", () => {
    const auth = useAuthStore();
    expect(auth.login("", "")).toMatchObject({
      ok: false,
      message: "请输入账号和密码",
      persisted: false
    });
    expect(auth.isAuthed).toBe(false);
  });

  it("账号或密码错误时给出统一提示", () => {
    const auth = useAuthStore();
    expect(auth.login(AUTH.username, "wrong-password")).toMatchObject({
      ok: false,
      message: "账号或密码错误，请重新输入"
    });
  });

  it("账号前后空格会被忽略", () => {
    const auth = useAuthStore();
    const result = auth.login(`  ${AUTH.username}  `, AUTH.password);
    expect(result.ok).toBe(true);
    expect(auth.isAuthed).toBe(true);
  });

  it("登录成功后写入会话并返回已持久化", () => {
    const auth = useAuthStore();
    const result = auth.login(AUTH.username, AUTH.password);

    expect(result).toMatchObject({ ok: true, persisted: true });
    expect(auth.session.username).toBe(AUTH.username);
    expect(Number.isFinite(auth.session.loginAt)).toBe(true);

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.session));
    expect(saved.username).toBe(AUTH.username);
  });

  it("存储写入失败时仍然完成本次登录", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    const auth = useAuthStore();
    const result = auth.login(AUTH.username, AUTH.password);

    expect(result).toMatchObject({ ok: true, persisted: false });
    expect(auth.isAuthed).toBe(true);
  });

  it("退出登录只清除会话，不影响已发布内容", () => {
    window.localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify([]));
    const auth = useAuthStore();
    auth.login(AUTH.username, AUTH.password);
    auth.logout();

    expect(auth.isAuthed).toBe(false);
    expect(auth.session).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEYS.session)).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEYS.posts)).not.toBeNull();
  });
});
