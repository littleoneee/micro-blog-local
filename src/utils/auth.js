import { AUTH } from "../constants/index.js";

/**
 * 校验登录凭据
 * @param {string} username
 * @param {string} password
 * @returns {{ ok: boolean, message: string }}
 */
export function verifyCredential(username, password) {
  const name = (username || "").trim();

  if (!name || !password) {
    return { ok: false, message: "请输入账号和密码" };
  }

  if (name !== AUTH.username || password !== AUTH.password) {
    return { ok: false, message: "账号或密码错误，请重新输入" };
  }

  return { ok: true, message: "" };
}
