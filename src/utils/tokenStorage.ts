import keytar from "keytar";
import { UserLoginData } from "./types";

export async function saveLoginData(userName: string, data: UserLoginData) {
  window.localStorage.setItem("userName", data.userName);
  return await keytar.setPassword("Dystance", userName, JSON.stringify(data));
}

export async function getLoginData(): Promise<UserLoginData> {
  const result = JSON.parse(await keytar.getPassword("Dystance", window.localStorage.getItem("userName")));
  return result;
}
