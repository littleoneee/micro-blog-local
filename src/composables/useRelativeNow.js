import { onUnmounted, ref } from "vue";

/**
 * 每 60 秒更新一次的当前时间戳，用于刷新相对时间文案
 * @param {number} interval 刷新间隔（毫秒）
 * @returns {import("vue").Ref<number>}
 */
export function useRelativeNow(interval = 60000) {
  const now = ref(Date.now());
  const timer = setInterval(() => {
    now.value = Date.now();
  }, interval);

  onUnmounted(() => clearInterval(timer));

  return now;
}
