import keytar from "keytar";
import Store from "electron-store";

export async function saveLoginData(userName: string, data: UserLoginData) {
  new Store().set("userName", data.userName);
  return await keytar.setPassword("Dystance", userName, JSON.stringify(data));
}

export async function getLoginData(): Promise<UserLoginData> {
  return JSON.parse(await keytar.getPassword("Dystance", new Store().get("userName") as string));
}
