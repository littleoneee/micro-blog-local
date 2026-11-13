/* ============================================================
 * 轻语 · 应用逻辑
 * 纯前端：登录门禁 + 短内容发布 + localStorage 持久化
 * ============================================================ */
(function () {
  "use strict";

  var STORAGE_KEYS = {
    posts: "qingyu.posts.v1",
    session: "qingyu.session.v1"
  };

  /* 演示用凭据：仅前端校验，不构成真实安全防护 */
  var AUTH = {
    username: "cs_lijiahao",
    password: "12345678"
  };

  var LIMITS = { content: 280, author: 20 };
  var LOGIN_DELAY = 420;

  /* 示例热点（静态内容，不写入本地存储） */
  var HOT_TOPICS = [
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

  /* 精选图集（静态内容） */
  var GALLERY_PHOTOS = [
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

  var el = {};
  var posts = [];
  var session = null;
  var loginTimer = null;
  var composeAlertTimer = null;

  /* ---------- 工具函数 ---------- */
  function $(id) {
    return document.getElementById(id);
  }

  function countChars(value) {
    return Array.from(value || "").length;
  }

  function clipText(value, max) {
    return Array.from(value || "").slice(0, max).join("");
  }

  function initialOf(name) {
    var value = (name || "").trim();
    return value ? Array.from(value)[0].toUpperCase() : "轻";
  }

  function createId() {
    return (
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 8)
    );
  }

  function unsplashUrl(photoId, width, height) {
    var params = "auto=format&fit=crop&w=" + width;
    if (height) params += "&h=" + height;
    return "https://images.unsplash.com/photo-" + photoId + "?" + params + "&q=60";
  }

  /* ---------- 存储层 ---------- */
  function readJSON(key) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function writeJSON(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function removeKey(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      /* 隐私模式或存储被禁用时静默降级 */
    }
  }

  function normalizePost(raw) {
    if (!raw || typeof raw !== "object") return null;

    var content = typeof raw.content === "string" ? raw.content : "";
    if (!content.trim()) return null;

    var createdAt = Number(raw.createdAt);

    return {
      id:
        typeof raw.id === "string" && raw.id
          ? raw.id
          : createId(),
      author:
        typeof raw.author === "string" && raw.author.trim()
          ? clipText(raw.author.trim(), LIMITS.author)
          : AUTH.username,
      content: content,
      createdAt: Number.isFinite(createdAt) ? createdAt : Date.now()
    };
  }

  function loadPosts() {
    var data = readJSON(STORAGE_KEYS.posts);
    if (!Array.isArray(data)) return [];

    return data
      .map(normalizePost)
      .filter(Boolean)
      .sort(function (a, b) {
        return b.createdAt - a.createdAt;
      });
  }

  function savePosts() {
    return writeJSON(STORAGE_KEYS.posts, posts);
  }

  function loadSession() {
    var data = readJSON(STORAGE_KEYS.session);
    if (!data || typeof data !== "object") return null;

    var loginAt = Number(data.loginAt);

    if (data.username !== AUTH.username || !Number.isFinite(loginAt)) {
      removeKey(STORAGE_KEYS.session);
      return null;
    }

    return { username: data.username, loginAt: loginAt };
  }

  function saveSession() {
    session = { username: AUTH.username, loginAt: Date.now() };
    return writeJSON(STORAGE_KEYS.session, session);
  }

  /* ---------- 登录校验 ---------- */
  function verifyCredential(username, password) {
    if (!username || !password) {
      return { ok: false, message: "请输入账号和密码" };
    }
    if (username !== AUTH.username || password !== AUTH.password) {
      return { ok: false, message: "账号或密码错误，请重新输入" };
    }
    return { ok: true };
  }

  /* ---------- 时间格式化 ---------- */
  function formatRelativeTime(timestamp) {
    var diff = Date.now() - timestamp;
    if (!Number.isFinite(diff) || diff < 0) return "刚刚";

    var seconds = Math.floor(diff / 1000);
    if (seconds < 60) return "刚刚";

    var minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + " 分钟前";

    var hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + " 小时前";

    var days = Math.floor(hours / 24);
    if (days < 7) return days + " 天前";

    var date = new Date(timestamp);
    var now = new Date();
    var monthDay = date.getMonth() + 1 + " 月 " + date.getDate() + " 日";

    if (date.getFullYear() === now.getFullYear()) return monthDay;
    return date.getFullYear() + " 年 " + monthDay;
  }

  /* ---------- DOM 缓存 ---------- */
  function cacheDom() {
    el.loginView = $("login-view");
    el.appView = $("app-view");

    el.loginCard = $("login-card");
    el.loginForm = $("login-form");
    el.username = $("login-username");
    el.password = $("login-password");
    el.togglePassword = $("toggle-password");
    el.iconEye = $("icon-eye");
    el.iconEyeOff = $("icon-eye-off");
    el.loginSubmit = $("login-submit");
    el.loginAlert = $("login-alert");

    el.logoutBtn = $("logout-btn");
    el.headerAvatar = $("header-avatar");
    el.headerUsername = $("header-username");

    el.composerAuthor = $("composer-author");
    el.composerAvatar = $("composer-avatar");
    el.composerContent = $("composer-content");
    el.counter = $("counter");
    el.counterNum = $("counter-num");
    el.publishBtn = $("publish-btn");
    el.composeAlert = $("compose-alert");

    el.feed = $("feed");
    el.emptyState = $("empty-state");
    el.feedCount = $("feed-count");
    el.totalCount = $("total-count");

    el.hotList = $("hot-list");
    el.gallery = $("gallery");
  }

  /* ---------- 提示信息 ---------- */
  function setLoginAlert(text, kind) {
    el.loginAlert.textContent = text || "";
    el.loginAlert.className =
      "form-alert" + (text && kind ? " is-" + kind : "");
  }

  function setComposeAlert(text, kind) {
    if (composeAlertTimer) {
      window.clearTimeout(composeAlertTimer);
      composeAlertTimer = null;
    }

    el.composeAlert.textContent = text || "";
    el.composeAlert.className =
      "form-alert form-alert--compose" + (text && kind ? " is-" + kind : "");

    if (text && kind === "success") {
      composeAlertTimer = window.setTimeout(function () {
        el.composeAlert.textContent = "";
        el.composeAlert.className = "form-alert form-alert--compose";
      }, 2400);
    }
  }

  function shakeLoginCard() {
    el.loginCard.classList.remove("is-shaking");
    /* 强制重排以重新触发动画 */
    void el.loginCard.offsetWidth;
    el.loginCard.classList.add("is-shaking");
  }

  /* ---------- 视图切换 ---------- */
  function showLogin(options) {
    var opts = options || {};

    el.appView.hidden = true;
    el.appView.setAttribute("aria-hidden", "true");

    el.loginView.hidden = false;
    el.loginView.removeAttribute("aria-hidden");
    document.body.dataset.view = "login";

    if (!opts.keepForm) {
      el.username.value = "";
      el.password.value = "";
      resetPasswordVisibility();
    }

    if (!opts.keepAlert) {
      setLoginAlert("");
    }

    if (opts.focus !== false) {
      window.setTimeout(function () {
        el.username.focus({ preventScroll: true });
      }, 90);
    }
  }

  function enterApp(options) {
    var opts = options || {};

    el.loginView.hidden = true;
    el.loginView.setAttribute("aria-hidden", "true");

    el.appView.hidden = false;
    el.appView.removeAttribute("aria-hidden");
    document.body.dataset.view = "app";

    var username = session ? session.username : AUTH.username;
    el.headerUsername.textContent = username;
    el.headerAvatar.textContent = initialOf(username);
    el.composerAuthor.value = username;
    el.composerAvatar.textContent = initialOf(username);

    renderAll();
    renderHotSections();
    updateComposer();
    setComposeAlert("");

    if (opts.focusComposer) {
      window.setTimeout(function () {
        el.composerContent.focus({ preventScroll: true });
      }, 140);
    }
  }

  /* ---------- 渲染 ---------- */
  function createPostNode(post, isNew) {
    var li = document.createElement("li");
    li.className = "post" + (isNew ? " post--new" : "");
    li.dataset.createdAt = String(post.createdAt);

    var avatar = document.createElement("span");
    avatar.className = "avatar";
    avatar.textContent = initialOf(post.author);
    avatar.setAttribute("aria-hidden", "true");

    var body = document.createElement("div");
    body.className = "post__body";

    var head = document.createElement("div");
    head.className = "post__head";

    var author = document.createElement("span");
    author.className = "post__author";
    author.textContent = post.author;

    var time = document.createElement("time");
    time.className = "post__time";
    time.dateTime = new Date(post.createdAt).toISOString();
    time.textContent = formatRelativeTime(post.createdAt);

    var content = document.createElement("p");
    content.className = "post__content";
    content.textContent = post.content;

    head.appendChild(author);
    head.appendChild(time);
    body.appendChild(head);
    body.appendChild(content);
    li.appendChild(avatar);
    li.appendChild(body);

    return li;
  }

  function syncMeta() {
    var total = posts.length;
    el.feedCount.textContent = total + " 条";
    el.totalCount.textContent = String(total);
    el.emptyState.hidden = total > 0;
    el.feed.hidden = total === 0;
  }

  function renderAll() {
    el.feed.textContent = "";

    var fragment = document.createDocumentFragment();
    for (var i = 0; i < posts.length; i += 1) {
      fragment.appendChild(createPostNode(posts[i], false));
    }
    el.feed.appendChild(fragment);

    syncMeta();
  }

  /* ---------- 热点与图集 ---------- */
  function createHotNode(topic) {
    var li = document.createElement("li");
    li.className = "hot-item";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hot-item__btn";
    btn.dataset.id = topic.id;
    btn.setAttribute("aria-label", "把话题「" + topic.title + "」填入发布框");

    var rank = document.createElement("span");
    rank.className =
      "hot-item__rank" + (topic.rank <= 3 ? " hot-item__rank--top" : "");
    rank.textContent = String(topic.rank);
    rank.setAttribute("aria-hidden", "true");

    var thumb = document.createElement("span");
    thumb.className = "hot-item__thumb";
    thumb.dataset.initial = Array.from(topic.title)[0] || "热";

    var img = document.createElement("img");
    img.src = unsplashUrl(topic.image, 160, 160);
    img.alt = topic.alt;
    img.loading = "lazy";
    img.decoding = "async";
    img.onerror = function () {
      thumb.classList.add("is-fallback");
      img.remove();
    };
    thumb.appendChild(img);

    var body = document.createElement("span");
    body.className = "hot-item__body";

    var title = document.createElement("span");
    title.className = "hot-item__title";
    title.textContent = topic.title;

    var meta = document.createElement("span");
    meta.className = "hot-item__meta";
    meta.textContent = topic.heat + " 热度 · " + topic.tag;

    body.appendChild(title);
    body.appendChild(meta);
    btn.appendChild(rank);
    btn.appendChild(thumb);
    btn.appendChild(body);
    li.appendChild(btn);

    return li;
  }

  function createPhotoNode(photo, isLead) {
    var figure = document.createElement("figure");
    figure.className = "gallery__item" + (isLead ? " gallery__item--lead" : "");

    var frame = document.createElement("div");
    frame.className = "gallery__frame";
    frame.dataset.initial = Array.from(photo.caption)[0] || "影";

    var img = document.createElement("img");
    img.src = unsplashUrl(photo.image, isLead ? 640 : 320, isLead ? 400 : 320);
    img.alt = photo.alt;
    img.loading = "lazy";
    img.decoding = "async";
    img.onerror = function () {
      frame.classList.add("is-fallback");
      img.remove();
    };
    frame.appendChild(img);

    var caption = document.createElement("figcaption");
    caption.className = "gallery__caption";
    caption.textContent = photo.caption;
    frame.appendChild(caption);

    figure.appendChild(frame);
    return figure;
  }

  function renderHotSections() {
    if (el.hotList && !el.hotList.childElementCount) {
      var hotFragment = document.createDocumentFragment();
      for (var i = 0; i < HOT_TOPICS.length; i += 1) {
        hotFragment.appendChild(createHotNode(HOT_TOPICS[i]));
      }
      el.hotList.appendChild(hotFragment);
    }

    if (el.gallery && !el.gallery.childElementCount) {
      var galleryFragment = document.createDocumentFragment();
      for (var j = 0; j < GALLERY_PHOTOS.length; j += 1) {
        galleryFragment.appendChild(createPhotoNode(GALLERY_PHOTOS[j], j === 0));
      }
      el.gallery.appendChild(galleryFragment);
    }
  }

  function handleHotPick(topicId) {
    var topic = null;
    for (var i = 0; i < HOT_TOPICS.length; i += 1) {
      if (HOT_TOPICS[i].id === topicId) {
        topic = HOT_TOPICS[i];
        break;
      }
    }
    if (!topic) return;

    var tag = "#" + topic.title + "# ";
    var current = el.composerContent.value;
    var next = current.trim()
      ? current.replace(/\s+$/, "") + " " + tag
      : tag;

    if (countChars(next) > LIMITS.content) {
      setComposeAlert("内容接近上限，先精简一下吧", "error");
      return;
    }

    el.composerContent.value = next;
    updateComposer();
    setComposeAlert("已把话题填入发布框", "success");
    el.composerContent.focus({ preventScroll: true });
    el.composerContent.setSelectionRange(next.length, next.length);
  }

  /* ---------- 发布 ---------- */
  function updateComposer() {
    var value = el.composerContent.value;
    var length = countChars(value);

    el.counterNum.textContent = String(length);
    el.counter.classList.toggle("is-over", length > LIMITS.content);
    el.publishBtn.disabled =
      !value.trim() || length > LIMITS.content;
  }

  function publish() {
    if (!session) return;

    var content = el.composerContent.value.replace(/\r\n?/g, "\n");

    if (!content.trim()) {
      setComposeAlert("写点什么再发布吧", "error");
      el.composerContent.focus({ preventScroll: true });
      return;
    }

    if (countChars(content) > LIMITS.content) {
      setComposeAlert("内容超过 " + LIMITS.content + " 字，请精简后再发布", "error");
      return;
    }

    var author = clipText(
      el.composerAuthor.value.trim() || AUTH.username,
      LIMITS.author
    );

    var post = {
      id: createId(),
      author: author,
      content: content,
      createdAt: Date.now()
    };

    posts.unshift(post);
    var saved = savePosts();

    el.composerAuthor.value = author;
    el.composerAvatar.textContent = initialOf(author);

    el.feed.insertBefore(createPostNode(post, true), el.feed.firstChild);

    el.composerContent.value = "";
    updateComposer();
    syncMeta();

    if (saved) {
      setComposeAlert("发布成功", "success");
    } else {
      setComposeAlert("内容已展示，但未能保存到本地存储", "error");
    }
  }

  /* ---------- 时间刷新 ---------- */
  function refreshTimes() {
    if (el.appView.hidden) return;

    var nodes = el.feed.querySelectorAll(".post");
    for (var i = 0; i < nodes.length; i += 1) {
      var node = nodes[i];
      var timestamp = Number(node.dataset.createdAt);
      var time = node.querySelector(".post__time");
      if (time && Number.isFinite(timestamp)) {
        time.textContent = formatRelativeTime(timestamp);
      }
    }
  }

  /* ---------- 密码显隐 ---------- */
  function resetPasswordVisibility() {
    el.password.type = "password";
    el.togglePassword.setAttribute("aria-pressed", "false");
    el.togglePassword.setAttribute("aria-label", "显示密码");
    el.iconEye.hidden = false;
    el.iconEyeOff.hidden = true;
  }

  function togglePasswordVisibility() {
    var show = el.password.type === "password";

    el.password.type = show ? "text" : "password";
    el.togglePassword.setAttribute("aria-pressed", show ? "true" : "false");
    el.togglePassword.setAttribute("aria-label", show ? "隐藏密码" : "显示密码");
    el.iconEye.hidden = show;
    el.iconEyeOff.hidden = !show;
    el.password.focus({ preventScroll: true });
  }

  /* ---------- 登录流程 ---------- */
  function setLoginPending(pending) {
    el.loginSubmit.disabled = pending;
    el.loginSubmit.classList.toggle("is-loading", pending);
    el.loginSubmit.querySelector(".btn__text").textContent = pending
      ? "验证中"
      : "登录";
    el.username.disabled = pending;
    el.password.disabled = pending;
  }

  function handleLogin(event) {
    event.preventDefault();
    if (loginTimer) return;

    var username = el.username.value.trim();
    var password = el.password.value;
    var result = verifyCredential(username, password);

    if (!result.ok) {
      setLoginAlert(result.message, "error");
      shakeLoginCard();
      if (!username) {
        el.username.focus({ preventScroll: true });
      } else {
        el.password.focus({ preventScroll: true });
        el.password.select();
      }
      return;
    }

    setLoginAlert("");
    setLoginPending(true);

    loginTimer = window.setTimeout(function () {
      loginTimer = null;
      var saved = saveSession();
      setLoginPending(false);
      enterApp({ focusComposer: true });

      if (!saved) {
        setComposeAlert("登录状态未能写入本地存储，刷新后需重新登录", "error");
      }
    }, LOGIN_DELAY);
  }

  function handleLogout() {
    removeKey(STORAGE_KEYS.session);
    session = null;
    showLogin({ keepForm: false });
    setLoginAlert("已退出登录", "info");
  }

  /* ---------- 事件绑定 ---------- */
  function bindEvents() {
    el.loginForm.addEventListener("submit", handleLogin);
    el.togglePassword.addEventListener("click", togglePasswordVisibility);
    el.logoutBtn.addEventListener("click", handleLogout);

    el.composerContent.addEventListener("input", function () {
      updateComposer();
      if (el.composeAlert.textContent) setComposeAlert("");
    });

    el.composerAuthor.addEventListener("input", function () {
      el.composerAvatar.textContent = initialOf(
        el.composerAuthor.value || AUTH.username
      );
    });

    el.composerContent.addEventListener("keydown", function (event) {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        publish();
      }
    });

    el.publishBtn.addEventListener("click", publish);

    el.hotList.addEventListener("click", function (event) {
      var target = event.target;
      var btn = target && target.closest ? target.closest(".hot-item__btn") : null;
      if (!btn) return;
      handleHotPick(btn.dataset.id);
    });

    window.setInterval(refreshTimes, 60000);
  }

  /* ---------- 启动 ---------- */
  function init() {
    cacheDom();
    posts = loadPosts();
    session = loadSession();
    bindEvents();

    if (session) {
      enterApp({ focusComposer: false });
    } else {
      showLogin({ focus: false });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
