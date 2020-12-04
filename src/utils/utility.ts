import _ from "lodash";
import { LoginLocalStorageKey, Role, User, UserLoginData } from "./interfaces";
import { AllUsersInfo } from "./consts";

let users: { [id: string]: User };

export function saveLoginData(data: UserLoginData) {
  localStorage.setItem(LoginLocalStorageKey.UserInfo, JSON.stringify(data));
}

export function getLoginData(): UserLoginData {
  return JSON.parse(localStorage.getItem(LoginLocalStorageKey.UserInfo));
}

export function getAllUsers(): User[] {
  return JSON.parse(sessionStorage.getItem(AllUsersInfo)) as User[];
}

export function getUser(id: string): User {
  if (!users) {
    users = _.transform(getAllUsers(), (acc, cur) => {
      acc[cur.id] = cur;
    });
  }

  return users[id];
}

export function getCurrentRole(): Role {
  const allUsers = JSON.parse(sessionStorage.getItem(AllUsersInfo)) as User[];
  return _.find(allUsers, { id: getLoginData()?.id })?.role;
}

export async function all<T>(array: T[], fn: (value: T) => Promise<void>) {
  return array.reduce(async (p, item) => {
    await p;
    return await fn(item);
  }, Promise.resolve());
}