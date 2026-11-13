import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import HotRail from "../../src/components/HotRail.vue";
import { GALLERY_PHOTOS, HOT_TOPICS } from "../../src/constants/index.js";

describe("HotRail", () => {
  it("渲染 6 条热点与 3 张图集，前三名带强调样式", () => {
    const wrapper = mount(HotRail);

    expect(wrapper.findAll(".hot-item")).toHaveLength(HOT_TOPICS.length);
    expect(wrapper.findAll(".gallery__item")).toHaveLength(GALLERY_PHOTOS.length);

    const ranks = wrapper.findAll(".hot-item__rank");
    expect(ranks[0].classes()).toContain("hot-item__rank--top");
    expect(ranks[2].classes()).toContain("hot-item__rank--top");
    expect(ranks[3].classes()).not.toContain("hot-item__rank--top");
  });

  it("点击热点派发 pick 事件并携带话题", async () => {
    const wrapper = mount(HotRail);
    await wrapper.findAll(".hot-item__btn")[0].trigger("click");

    const events = wrapper.emitted("pick");
    expect(events).toHaveLength(1);
    expect(events[0][0]).toMatchObject({ id: HOT_TOPICS[0].id });
  });

  it("缩略图加载失败时切换为占位并移除图片", async () => {
    const wrapper = mount(HotRail);
    const firstThumb = wrapper.findAll(".hot-item__thumb")[0];

    await firstThumb.find("img").trigger("error");

    expect(firstThumb.classes()).toContain("is-fallback");
    expect(firstThumb.find("img").exists()).toBe(false);
  });
});
