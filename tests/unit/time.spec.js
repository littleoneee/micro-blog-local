import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "../../src/utils/time.js";

const NOW = new Date(2026, 10, 13, 12, 0, 0).getTime();
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("formatRelativeTime", () => {
  it("一分钟内显示刚刚", () => {
    expect(formatRelativeTime(NOW - 30 * 1000, NOW)).toBe("刚刚");
    expect(formatRelativeTime(NOW, NOW)).toBe("刚刚");
  });

  it("一小时内显示分钟", () => {
    expect(formatRelativeTime(NOW - MINUTE, NOW)).toBe("1 分钟前");
    expect(formatRelativeTime(NOW - 59 * MINUTE, NOW)).toBe("59 分钟前");
  });

  it("一天内显示小时", () => {
    expect(formatRelativeTime(NOW - HOUR, NOW)).toBe("1 小时前");
    expect(formatRelativeTime(NOW - 23 * HOUR, NOW)).toBe("23 小时前");
  });

  it("一周内显示天数", () => {
    expect(formatRelativeTime(NOW - DAY, NOW)).toBe("1 天前");
    expect(formatRelativeTime(NOW - 6 * DAY, NOW)).toBe("6 天前");
  });

  it("同年较早时间显示月日", () => {
    const timestamp = new Date(2026, 0, 2, 9, 30).getTime();
    expect(formatRelativeTime(timestamp, NOW)).toBe("1 月 2 日");
  });

  it("跨年时间显示年份", () => {
    const timestamp = new Date(2025, 11, 31, 9, 30).getTime();
    expect(formatRelativeTime(timestamp, NOW)).toBe("2025 年 12 月 31 日");
  });

  it("未来时间与非法时间回落为刚刚", () => {
    expect(formatRelativeTime(NOW + 10 * 1000, NOW)).toBe("刚刚");
    expect(formatRelativeTime(Number.NaN, NOW)).toBe("刚刚");
  });
});
