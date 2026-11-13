/** localStorage 键名（与旧版保持一致，升级后可继续读取历史数据） */
export const STORAGE_KEYS = {
  posts: "qingyu.posts.v1",
  session: "qingyu.session.v1"
};

/** 演示用凭据：仅前端校验，不构成真实安全防护 */
export const AUTH = {
  username: "cs_lijiahao",
  password: "12345678"
};

export const LIMITS = {
  content: 280,
  author: 20
};

export const LOGIN_DELAY = 420;

/** 示例热点（静态内容，不写入本地存储） */
export const HOT_TOPICS = [
  {
    id: "hot-city-night",
    rank: 1,
    title: "城市夜跑路线走红，江边灯光成打卡点",
    tag: "城市",
    heat: "128.4 万",
    image: "1519501025264-65ba15a82390",
    alt: "夜幕下的城市天际线"
  },
  {
    id: "hot-autumn-lake",
    rank: 2,
    title: "秋日山湖徒步季开启，清晨云海刷屏",
    tag: "旅行",
    heat: "96.7 万",
    image: "1506744038136-46273834b3fb",
    alt: "山间湖泊与云雾"
  },
  {
    id: "hot-coffee",
    rank: 3,
    title: "街角咖啡店推出秋日限定，排队一小时",
    tag: "生活",
    heat: "74.2 万",
    image: "1509042239860-f550ce710b93",
    alt: "桌面上的一杯咖啡"
  },
  {
    id: "hot-laptop",
    rank: 4,
    title: "新款轻薄本发布，续航与屏幕成讨论焦点",
    tag: "科技",
    heat: "58.9 万",
    image: "1518770660439-4636190af475",
    alt: "电路板与芯片特写"
  },
  {
    id: "hot-cat",
    rank: 5,
    title: "猫咪午睡姿势走红，网友晒出同款",
    tag: "萌宠",
    heat: "41.3 万",
    image: "1518791841217-8f162f1e1131",
    alt: "趴在窗边的猫"
  },
  {
    id: "hot-sea",
    rank: 6,
    title: "周末海边露营热度上升，日出时段最抢手",
    tag: "户外",
    heat: "33.8 万",
    image: "1507525428034-b723cf961d3e",
    alt: "海浪拍打沙滩"
  }
];

/** 精选图集（静态内容） */
export const GALLERY_PHOTOS = [
  {
    image: "1441974231531-c6227db76b6e",
    caption: "林间晨光，落在安静的步道上",
    alt: "阳光穿过森林"
  },
  {
    image: "1504674900247-0877df9cc836",
    caption: "一桌热食的傍晚",
    alt: "餐桌上的美食"
  },
  {
    image: "1487958449943-2429e8be8625",
    caption: "城市的几何线条",
    alt: "现代建筑立面"
  }
];
