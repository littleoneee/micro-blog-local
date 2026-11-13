import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import LoginView from "../../src/components/LoginView.vue";
import { useAuthStore } from "../../src/stores/auth.js";
import { AUTH, STORAGE_KEYS } from "../../src/constants/index.js";

function mountLogin() {
  const pinia = createPinia();
  const wrapper = mount(LoginView, { global: { plugins: [pinia] } });
  const auth = useAuthStore(pinia);
  return { wrapper, auth };
}

async function fillAndSubmit(wrapper, username, password) {
  await wrapper.find("#login-username").setValue(username);
  await wrapper.find("#login-password").setValue(password);
  await wrapper.find("#login-form").trigger("submit");
}

describe("LoginView", () => {
  it("渲染账号、密码与登录按钮", () => {
    const { wrapper } = mountLogin();
    expect(wrapper.find("#login-username").exists()).toBe(true);
    expect(wrapper.find("#login-password").exists()).toBe(true);
    expect(wrapper.find("#login-submit").text()).toContain("登录");
  });

  it("空提交提示补全账号密码", async () => {
    const { wrapper } = mountLogin();
    await wrapper.find("#login-form").trigger("submit");

    expect(wrapper.find("#login-alert").text()).toContain("请输入账号和密码");
    expect(wrapper.emitted("success")).toBeUndefined();
  });

  it("凭据错误时提示且不登录", async () => {
    const { wrapper, auth } = mountLogin();
    await fillAndSubmit(wrapper, AUTH.username, "wrong");

    expect(wrapper.find("#login-alert").text()).toContain("账号或密码错误");
    expect(auth.isAuthed).toBe(false);
  });

  it("正确凭据在延迟后登录并派发 success", async () => {
    vi.useFakeTimers();
    const { wrapper, auth } = mountLogin();

    await fillAndSubmit(wrapper, AUTH.username, AUTH.password);
    expect(wrapper.find("#login-submit").attributes("disabled")).toBeDefined();

    await vi.advanceTimersByTimeAsync(420);
    await flushPromises();

    expect(auth.isAuthed).toBe(true);
    expect(wrapper.emitted("success")).toHaveLength(1);
    expect(window.localStorage.getItem(STORAGE_KEYS.session)).not.toBeNull();
  });

  it("提交中禁用输入框与按钮", async () => {
    vi.useFakeTimers();
    const { wrapper } = mountLogin();

    await fillAndSubmit(wrapper, AUTH.username, AUTH.password);

    expect(wrapper.find("#login-submit").attributes("disabled")).toBeDefined();
    expect(wrapper.find("#login-username").attributes("disabled")).toBeDefined();
    expect(wrapper.find("#login-password").attributes("disabled")).toBeDefined();
    expect(wrapper.find("#login-submit").classes()).toContain("is-loading");

    await vi.advanceTimersByTimeAsync(420);
    await flushPromises();
  });

  it("密码显隐按钮切换输入框类型", async () => {
    const { wrapper } = mountLogin();
    expect(wrapper.find("#login-password").attributes("type")).toBe("password");

    await wrapper.find("#toggle-password").trigger("click");
    expect(wrapper.find("#login-password").attributes("type")).toBe("text");

    await wrapper.find("#toggle-password").trigger("click");
    expect(wrapper.find("#login-password").attributes("type")).toBe("password");
  });
});
