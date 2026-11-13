import { describe, expect, it } from "vitest";
import { createStorage } from "../../src/services/storage.js";

function memoryStorage() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    }
  };
}

function throwingStorage() {
  return {
    getItem() {
      throw new Error("storage disabled");
    },
    setItem() {
      throw new Error("quota exceeded");
    },
    removeItem() {
      throw new Error("storage disabled");
    }
  };
}

describe("createStorage", () => {
  it("写入后可以原样读回对象", () => {
    const storage = createStorage(memoryStorage());
    expect(storage.writeJSON("demo", { a: 1 })).toBe(true);
    expect(storage.readJSON("demo")).toEqual({ a: 1 });
  });

  it("读取不存在的 key 返回 null", () => {
    const storage = createStorage(memoryStorage());
    expect(storage.readJSON("missing")).toBeNull();
  });

  it("内容不是合法 JSON 时返回 null", () => {
    const raw = memoryStorage();
    raw.setItem("broken", "{not-json");
    const storage = createStorage(raw);
    expect(storage.readJSON("broken")).toBeNull();
  });

  it("写入抛错时返回 false 而不是抛出异常", () => {
    const storage = createStorage(throwingStorage());
    expect(storage.writeJSON("demo", { a: 1 })).toBe(false);
  });

  it("读取抛错时返回 null", () => {
    const storage = createStorage(throwingStorage());
    expect(storage.readJSON("demo")).toBeNull();
  });

  it("删除抛错时不向外抛出异常", () => {
    const storage = createStorage(throwingStorage());
    expect(() => storage.remove("demo")).not.toThrow();
  });

  it("删除后读不到数据", () => {
    const storage = createStorage(memoryStorage());
    storage.writeJSON("demo", { a: 1 });
    storage.remove("demo");
    expect(storage.readJSON("demo")).toBeNull();
  });
});
