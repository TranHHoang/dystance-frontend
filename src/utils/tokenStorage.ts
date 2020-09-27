import { LoginLocalStorageKey, UserLoginData } from "./types";

export function saveLoginData(data: UserLoginData) {
  localStorage.setItem(LoginLocalStorageKey.UserInfo, JSON.stringify(data));
}

export function getLoginData(): UserLoginData {
  return JSON.parse(localStorage.getItem(LoginLocalStorageKey.UserInfo));
}

export function removeLoginData() {
  localStorage.removeItem(LoginLocalStorageKey.UserInfo);
}
