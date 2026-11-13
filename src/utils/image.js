/**
 * 拼接 Unsplash 图片地址
 * @param {string} photoId 图片 id（不含域名与 photo- 前缀）
 * @param {number} width 宽度
 * @param {number} [height] 高度，省略则按宽度等比
 * @returns {string}
 */
export function unsplashUrl(photoId, width, height) {
  let params = `auto=format&fit=crop&w=${width}`;
  if (height) params += `&h=${height}`;
  return `https://images.unsplash.com/photo-${photoId}?${params}&q=60`;
}
