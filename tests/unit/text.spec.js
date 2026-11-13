import { describe, expect, it } from "vitest";
import { clipText, countChars, createId, initialOf } from "../../src/utils/text.js";

describe("countChars", () => {
  it("按字符数统计中文长度", () => {
    expect(countChars("你好")).toBe(2);
  });

  it("把 emoji 视为一个字符", () => {
    expect(countChars("😀")).toBe(1);
  });

  it("空值与空串返回 0", () => {
    expect(countChars("")).toBe(0);
    expect(countChars(null)).toBe(0);
    expect(countChars(undefined)).toBe(0);
  });
});

describe("clipText", () => {
  it("超长文本按字符截断", () => {
    expect(clipText("abcdef", 3)).toBe("abc");
  });

  it("中文与 emoji 均按字符截断", () => {
    expect(clipText("你好世界", 2)).toBe("你好");
    expect(clipText("😀😀😀", 2)).toBe("😀😀");
  });

  it("短文本原样返回，空值返回空串", () => {
    expect(clipText("ok", 5)).toBe("ok");
    expect(clipText(null, 5)).toBe("");
  });
});

describe("initialOf", () => {
  it("英文昵称取首字母并大写", () => {
    expect(initialOf("cs_lijiahao")).toBe("C");
  });

  it("中文昵称取首字", () => {
    expect(initialOf("阿明")).toBe("阿");
  });

  it("空白昵称回落为站点首字", () => {
    expect(initialOf("")).toBe("轻");
    expect(initialOf("   ")).toBe("轻");
    expect(initialOf(null)).toBe("轻");
  });
});

describe("createId", () => {
  it("生成非空且互不相同的字符串", () => {
    const first = createId();
    const second = createId();
    expect(typeof first).toBe("string");
    expect(first.length).toBeGreaterThan(0);
    expect(first).not.toBe(second);
  });
});
