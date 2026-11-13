/**
 * 本地存储服务：所有读写都做异常兜底，存储不可用时静默降级
 * @param {Storage} [storage] 可注入的存储实现，默认 window.localStorage
 */
export function createStorage(storage) {
  function resolveStorage() {
    if (storage) return storage;
    try {
      return window.localStorage;
    } catch (error) {
      return null;
    }
  }

  return {
    /**
     * @param {string} key
     * @returns {*} 解析失败或不存在时返回 null
     */
    readJSON(key) {
      try {
        const target = resolveStorage();
        if (!target) return null;
        const raw = target.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (error) {
        return null;
      }
    },

    /**
     * @param {string} key
     * @param {*} value
     * @returns {boolean} 是否成功写入
     */
    writeJSON(key, value) {
      try {
        const target = resolveStorage();
        if (!target) return false;
        target.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        return false;
      }
    },

    /**
     * 删除失败时静默忽略
     * @param {string} key
     */
    remove(key) {
      try {
        const target = resolveStorage();
        if (!target) return;
        target.removeItem(key);
      } catch (error) {
        /* 隐私模式或存储被禁用时忽略 */
      }
    }
  };
}
