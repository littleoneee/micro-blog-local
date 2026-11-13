/**
 * 按 Unicode 字符统计长度（emoji 计为 1）
 * @param {string} value
 * @returns {number}
 */
export function countChars(value) {
  return Array.from(value || "").length;
}

/**
 * 按字符截断文本
 * @param {string} value
 * @param {number} max
 * @returns {string}
 */
export function clipText(value, max) {
  return Array.from(value || "").slice(0, max).join("");
}

/**
 * 取昵称首字，空白时回落到站点首字
 * @param {string} name
 * @returns {string}
 */
export function initialOf(name) {
  const value = (name || "").trim();
  return value ? Array.from(value)[0].toUpperCase() : "轻";
}

/**
 * 生成内容唯一标识
 * @returns {string}
 */
export function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
