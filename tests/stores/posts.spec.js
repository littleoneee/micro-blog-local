import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { usePostsStore } from "../../src/stores/posts.js";
import { AUTH, LIMITS, STORAGE_KEYS } from "../../src/constants/index.js";

function seedPosts(items) {
  window.localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(items));
}

describe("posts store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("加载时过滤脏数据并按时间倒序排列", () => {
    seedPosts([
      { id: "old", author: "阿明", content: "旧内容", createdAt: 1000 },
      null,
      { content: "   " },
      { content: "没有作者" },
      { id: "new", author: "小夏", content: "新内容", createdAt: 5000 }
    ]);

    const posts = usePostsStore();
    posts.load();

    expect(posts.total).toBe(3);
    expect(posts.posts.map((item) => item.content)).toEqual([
      "没有作者",
      "新内容",
      "旧内容"
    ]);
    expect(posts.posts[1].content).toBe("新内容");
  });

  it("存储内容不是数组时回落为空列表", () => {
    window.localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify({ oops: true }));

    const posts = usePostsStore();
    posts.load();

    expect(posts.posts).toEqual([]);
    expect(posts.total).toBe(0);
  });

  it("拒绝空白内容", () => {
    const posts = usePostsStore();
    const result = posts.publish({ content: "   ", author: "我" });

    expect(result).toMatchObject({ ok: false, message: "写点什么再发布吧" });
    expect(posts.total).toBe(0);
  });

  it("拒绝超过字数上限的内容", () => {
    const posts = usePostsStore();
    const result = posts.publish({
      content: "字".repeat(LIMITS.content + 1),
      author: "我"
    });

    expect(result.ok).toBe(false);
    expect(result.message).toContain(String(LIMITS.content));
    expect(posts.total).toBe(0);
  });

  it("发布成功后置顶、归一化换行并写入本地存储", () => {
    const posts = usePostsStore();
    const result = posts.publish({
      content: "第一行\r\n第二行",
      author: "  小明  "
    });

    expect(result).toMatchObject({ ok: true, persisted: true });
    expect(posts.total).toBe(1);
    expect(posts.posts[0]).toMatchObject({
      author: "小明",
      content: "第一行\n第二行"
    });
    expect(typeof posts.posts[0].createdAt).toBe("number");
    expect(result.post.id).toBe(posts.posts[0].id);

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.posts));
    expect(saved).toHaveLength(1);
    expect(saved[0].content).toBe("第一行\n第二行");
  });

  it("昵称为空时回落到登录账号，超长时截断", () => {
    const posts = usePostsStore();
    const first = posts.publish({ content: "无昵称", author: "  " });
    expect(first.post.author).toBe(AUTH.username);

    const longName = "名".repeat(LIMITS.author + 5);
    const second = posts.publish({ content: "超长昵称", author: longName });
    expect(Array.from(second.post.author)).toHaveLength(LIMITS.author);
  });

  it("写入失败时仍保留本次发布并返回未持久化", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    const posts = usePostsStore();
    const result = posts.publish({ content: "写盘失败也要展示", author: "我" });

    expect(result).toMatchObject({ ok: true, persisted: false });
    expect(posts.total).toBe(1);
  });
});
