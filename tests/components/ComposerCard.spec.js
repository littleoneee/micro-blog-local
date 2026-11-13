import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import ComposerCard from "../../src/components/ComposerCard.vue";
import { useAuthStore } from "../../src/stores/auth.js";
import { usePostsStore } from "../../src/stores/posts.js";
import { AUTH, HOT_TOPICS, LIMITS } from "../../src/constants/index.js";

function mountComposer() {
  const pinia = createPinia();
  const auth = useAuthStore(pinia);
  auth.login(AUTH.username, AUTH.password);

  const wrapper = mount(ComposerCard, {
    global: { plugins: [pinia] },
    attachTo: document.body
  });
  return { wrapper, posts: usePostsStore(pinia), auth };
}

describe("ComposerCard", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("空内容时发布按钮禁用，输入后可用并更新计数", async () => {
    const { wrapper } = mountComposer();
    const button = wrapper.find("#publish-btn");

    expect(button.attributes("disabled")).toBeDefined();
    expect(wrapper.find("#counter-num").text()).toBe("0");

    await wrapper.find("#composer-content").setValue("你好");
    expect(wrapper.find("#counter-num").text()).toBe("2");
    expect(wrapper.find("#publish-btn").attributes("disabled")).toBeUndefined();
  });

  it("超出上限时计数标红并禁用发布", async () => {
    const { wrapper } = mountComposer();
    await wrapper.find("#composer-content").setValue("字".repeat(LIMITS.content + 1));

    expect(wrapper.find("#counter").classes()).toContain("is-over");
    expect(wrapper.find("#publish-btn").attributes("disabled")).toBeDefined();
  });

  it("点击发布后写入 store、清空输入并提示成功", async () => {
    const { wrapper, posts } = mountComposer();
    await wrapper.find("#composer-content").setValue("第一条内容");
    await wrapper.find("#publish-btn").trigger("click");

    expect(posts.total).toBe(1);
    expect(posts.posts[0].content).toBe("第一条内容");
    expect(wrapper.find("#composer-content").element.value).toBe("");
    expect(wrapper.find("#compose-alert").text()).toContain("发布成功");
  });

  it("Ctrl + Enter 可以发布", async () => {
    const { wrapper, posts } = mountComposer();
    await wrapper.find("#composer-content").setValue("快捷键发布");
    await wrapper.find("#composer-content").trigger("keydown", {
      key: "Enter",
      ctrlKey: true
    });

    expect(posts.total).toBe(1);
    expect(posts.posts[0].content).toBe("快捷键发布");
  });

  it("applyTopic 在正文前追加话题并聚焦", async () => {
    const { wrapper } = mountComposer();
    wrapper.vm.applyTopic(HOT_TOPICS[0]);
    await nextTick();

    expect(wrapper.find("#composer-content").element.value).toBe(
      `#${HOT_TOPICS[0].title}# `
    );
    expect(document.activeElement).toBe(wrapper.find("#composer-content").element);
  });

  it("追加话题会超出上限时给出提示且不修改正文", async () => {
    const { wrapper } = mountComposer();
    await wrapper.find("#composer-content").setValue("字".repeat(LIMITS.content - 2));

    wrapper.vm.applyTopic(HOT_TOPICS[0]);
    await nextTick();

    expect(wrapper.find("#composer-content").element.value).toBe(
      "字".repeat(LIMITS.content - 2)
    );
    expect(wrapper.find("#compose-alert").text()).toContain("先精简一下");
  });

  it("写盘失败时仍展示内容并提示未保存", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    const { wrapper, posts } = mountComposer();
    await wrapper.find("#composer-content").setValue("未保存的内容");
    await wrapper.find("#publish-btn").trigger("click");

    expect(posts.total).toBe(1);
    expect(wrapper.find("#compose-alert").text()).toContain("未能保存");
  });
});
