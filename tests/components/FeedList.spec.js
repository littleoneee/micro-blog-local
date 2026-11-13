import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import FeedList from "../../src/components/FeedList.vue";
import { usePostsStore } from "../../src/stores/posts.js";

function mountFeed(items) {
  const pinia = createPinia();
  const posts = usePostsStore(pinia);
  posts.posts = items;
  const wrapper = mount(FeedList, { global: { plugins: [pinia] } });
  return { wrapper, posts };
}

describe("FeedList", () => {
  it("没有内容时展示空状态与 0 条", () => {
    const { wrapper } = mountFeed([]);

    expect(wrapper.find("#feed-count").text()).toBe("0 条");
    expect(wrapper.find("#empty-state").exists()).toBe(true);
    expect(wrapper.findAll(".post")).toHaveLength(0);
  });

  it("有内容时展示条数与正文，并隐藏空状态", () => {
    const now = Date.now();
    const { wrapper } = mountFeed([
      {
        id: "1",
        author: "阿明",
        content: "第一条\n第二行",
        createdAt: now - 5 * 60 * 1000
      },
      {
        id: "2",
        author: "小夏",
        content: "第二条",
        createdAt: now - 2 * 60 * 60 * 1000
      }
    ]);

    const items = wrapper.findAll(".post");
    expect(wrapper.find("#feed-count").text()).toBe("2 条");
    expect(wrapper.find("#empty-state").exists()).toBe(false);
    expect(items).toHaveLength(2);

    expect(items[0].find(".post__author").text()).toBe("阿明");
    expect(items[0].find(".post__content").text()).toContain("第一条");
    expect(items[0].find(".post__time").text()).toBe("5 分钟前");
    expect(items[1].find(".post__time").text()).toBe("2 小时前");
  });
});
