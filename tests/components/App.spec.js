import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import App from "../../src/App.vue";
import { useAuthStore } from "../../src/stores/auth.js";
import { AUTH, HOT_TOPICS } from "../../src/constants/index.js";

function mountApp(options = {}) {
  const pinia = createPinia();
  const auth = useAuthStore(pinia);

  if (options.authed) {
    auth.session = { username: AUTH.username, loginAt: Date.now() };
  }

  const wrapper = mount(App, { global: { plugins: [pinia] } });
  return { wrapper, auth };
}

describe("App", () => {
  it("未登录时只渲染登录视图", () => {
    const { wrapper } = mountApp();

    expect(wrapper.find(".auth").exists()).toBe(true);
    expect(wrapper.find(".app").exists()).toBe(false);
    expect(wrapper.find("#login-username").exists()).toBe(true);
  });

  it("已登录时渲染主界面，退出登录后回到登录视图", async () => {
    const { wrapper, auth } = mountApp({ authed: true });

    expect(wrapper.find(".app").exists()).toBe(true);
    expect(wrapper.find(".auth").exists()).toBe(false);
    expect(wrapper.find("#composer-content").exists()).toBe(true);
    expect(wrapper.find("#hot-list").exists()).toBe(true);

    await wrapper.find("#logout-btn").trigger("click");

    expect(auth.isAuthed).toBe(false);
    expect(wrapper.find(".app").exists()).toBe(false);
    expect(wrapper.find(".auth").exists()).toBe(true);
  });

  it("点击热点把话题填入发布框", async () => {
    const { wrapper } = mountApp({ authed: true });

    await wrapper.findAll(".hot-item__btn")[0].trigger("click");

    expect(wrapper.find("#composer-content").element.value).toBe(
      `#${HOT_TOPICS[0].title}# `
    );
  });
});
