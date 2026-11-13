import { describe, expect, it } from "vitest";
import { unsplashUrl } from "../../src/utils/image.js";

describe("unsplashUrl", () => {
  it("同时拼接宽高参数", () => {
    expect(unsplashUrl("abc123", 160, 160)).toBe(
      "https://images.unsplash.com/photo-abc123?auto=format&fit=crop&w=160&h=160&q=60"
    );
  });

  it("不传高度时省略 h 参数", () => {
    expect(unsplashUrl("abc123", 640)).toBe(
      "https://images.unsplash.com/photo-abc123?auto=format&fit=crop&w=640&q=60"
    );
  });
});
