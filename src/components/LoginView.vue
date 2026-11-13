<script setup>
import { computed, ref } from "vue";
import { LOGIN_DELAY } from "../constants/index.js";
import { useAuthStore } from "../stores/auth.js";
import { verifyCredential } from "../utils/auth.js";

const emit = defineEmits(["success"]);
const auth = useAuthStore();

const username = ref("");
const password = ref("");
const showPassword = ref(false);
const pending = ref(false);
const error = ref("");
const cardEl = ref(null);
const usernameEl = ref(null);
const passwordEl = ref(null);

const alertClass = computed(() =>
  error.value ? "form-alert is-error" : "form-alert"
);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shake() {
  const card = cardEl.value;
  if (!card) return;
  card.classList.remove("is-shaking");
  void card.offsetWidth;
  card.classList.add("is-shaking");
}

async function handleSubmit() {
  if (pending.value) return;

  const check = verifyCredential(username.value, password.value);
  if (!check.ok) {
    error.value = check.message;
    shake();
    if (!username.value.trim()) {
      usernameEl.value && usernameEl.value.focus();
    } else if (passwordEl.value) {
      passwordEl.value.focus();
      passwordEl.value.select();
    }
    return;
  }

  error.value = "";
  pending.value = true;
  await sleep(LOGIN_DELAY);

  const result = auth.login(username.value, password.value);
  pending.value = false;

  if (result.ok) emit("success");
  else error.value = result.message;
}
</script>

<template>
  <div class="auth" id="login-view">
    <div class="auth__backdrop" aria-hidden="true">
      <span class="orb orb--one"></span>
      <span class="orb orb--two"></span>
      <span class="orb orb--three"></span>
    </div>

    <main class="auth__inner">
      <section ref="cardEl" class="login-card" aria-labelledby="login-title">
        <div class="brand brand--stack">
          <span class="brand__mark brand__mark--lg" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 4.5c0 8.5-6 14.5-15.5 14.5H4c0-8.5 6.5-14.5 16-14.5Z" />
              <path d="M4 20 14.5 9.5" />
            </svg>
          </span>
          <h1 class="brand__title" id="login-title">轻语</h1>
          <p class="brand__sub">把此刻，轻轻写下来</p>
        </div>

        <form class="login-form" id="login-form" novalidate @submit.prevent="handleSubmit">
          <div class="field">
            <label class="field__label" for="login-username">账号</label>
            <div class="field__box">
              <svg
                class="field__icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="3.6" />
                <path d="M5 20c0-3.7 3.1-6.2 7-6.2s7 2.5 7 6.2" />
              </svg>
              <input
                id="login-username"
                ref="usernameEl"
                v-model="username"
                class="field__input"
                name="username"
                type="text"
                autocomplete="username"
                spellcheck="false"
                placeholder="请输入账号"
                :disabled="pending"
              />
            </div>
          </div>

          <div class="field">
            <label class="field__label" for="login-password">密码</label>
            <div class="field__box">
              <svg
                class="field__icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect x="4.5" y="10" width="15" height="10.5" rx="2.6" />
                <path d="M8 10V7.6a4 4 0 0 1 8 0V10" />
              </svg>
              <input
                id="login-password"
                ref="passwordEl"
                v-model="password"
                class="field__input"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="请输入密码"
                :disabled="pending"
              />
              <button
                id="toggle-password"
                class="field__toggle"
                type="button"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                :aria-pressed="showPassword ? 'true' : 'false'"
                :disabled="pending"
                @click="showPassword = !showPassword"
              >
                <svg
                  v-if="!showPassword"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="m3 3 18 18" />
                  <path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a17.6 17.6 0 0 1-2.3 3" />
                  <path d="M6.2 7.8A17.2 17.2 0 0 0 2.5 12S6 18 12 18c1.4 0 2.7-.3 3.8-.8" />
                  <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                </svg>
              </button>
            </div>
          </div>

          <p :class="alertClass" id="login-alert" role="alert" aria-live="polite">
            {{ error }}
          </p>

          <button
            id="login-submit"
            class="btn btn--primary btn--block"
            :class="{ 'is-loading': pending }"
            type="submit"
            :disabled="pending"
          >
            <span class="btn__text">{{ pending ? "验证中" : "登录" }}</span>
            <span class="btn__spinner" aria-hidden="true"></span>
          </button>
        </form>

        <p class="login-card__note">演示站点 · 账号密码于前端校验，仅作界面演示</p>
      </section>

      <p class="auth__foot">所有内容仅保存在本机浏览器 · 无需联网</p>
    </main>
  </div>
</template>
