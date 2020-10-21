import NodeCache from "node-cache";
import Axios from "./fakeAPI";
import { hostName } from "./hostUtils";

export interface UserLoginData {
  id: string;
  userName: string;
  accessToken: string;
  refreshToken: string;
  expires?: string;
}

export enum LoginLocalStorageKey {
  EmailOrUserName = "login/emailOrUserName",
  GoogleEmail = "login/googleEmail",
  UserInfo = "login/userInfo"
}

export interface Room {
  roomId: string;
  roomName: string;
  creatorId: string;
  image: string;
  description: string;
  startDate: string;
  endDate: string;
  startHour: string;
  endHour: string;
}

export interface ErrorResponse {
  type: number;
  message: string;
}

export interface User {
  id: string;
  userName: string;
  realName: string;
  email: string;
  dob: string;
  password: string;
  newPassword: string;
  avatar: string;
}

export interface UserInfo {
  userName: string;
  realName: string;
  avatar: string;
  id: string;
}

const nodeCache = new NodeCache();
export async function getUserInfo(userId: string): Promise<UserInfo> {
  try {
    if (nodeCache.get(userId)) {
      return nodeCache.get(userId) as UserInfo;
    }
    const response = await Axios.get(`${hostName}/api/users/info?id=${userId}`);
    nodeCache.set(userId, response.data);
    return response.data as UserInfo;
  } catch (ex) {
    // TODO: Handle this
    console.log(ex);
  }
}

export const RoomAction = "RoomAction";
export const PrivateMessage = "PrivateMessage";

export enum RoomActionType {
  Join,
  Leave,
  Chat,
  Kick,
  Mute
}

export const NotificationAction = "";

export enum NotificationActionType {
  Join,
  Chat,
  Leave
}
