/**
 * 相对时间格式化：刚刚 / N 分钟前 / N 小时前 / N 天前 / 月日 / 年月日
 * @param {number} timestamp 目标时间戳（毫秒）
 * @param {number} now 参照时间戳（毫秒），便于测试注入
 * @returns {string}
 */
export function formatRelativeTime(timestamp, now = Date.now()) {
  const diff = now - timestamp;
  if (!Number.isFinite(diff) || diff < 0) return "刚刚";

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "刚刚";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} 分钟前`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} 天前`;

  const date = new Date(timestamp);
  const current = new Date(now);
  const monthDay = `${date.getMonth() + 1} 月 ${date.getDate()} 日`;

  if (date.getFullYear() === current.getFullYear()) return monthDay;
  return `${date.getFullYear()} 年 ${monthDay}`;
}
