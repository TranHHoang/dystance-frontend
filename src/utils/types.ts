import NodeCache from "node-cache";
import Axios from "./fakeAPI";
import { hostName } from "./hostUtils";

export const AllUsersInfo = "allUsersInfo"; // For autocomplete function

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
  repeatOccurrence: string;
  roomTimes: string;
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

export interface UserTableInfo {
  id?: string;
  code: string;
  email: string;
  realName: string;
  dob: string;
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
  Mute,
  ToggleWhiteboard,
  GroupNotification,
  StopGroup
}
export interface DeadlineInfo {
  deadlineId: string;
  creatorId: string;
  roomId: string;
  title: string;
  endDate: string;
  description: string;
}
export enum TimetableEventType {
  Schedule,
  Deadline
}
export interface TimetableEvent {
  id: string;
  eventType: TimetableEventType;
  roomId: string;
  title: string;
  creatorId: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface RoomTimes {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export async function all<T>(array: T[], fn: (value: T) => Promise<void>) {
  return array.reduce(async (p, item) => {
    await p;
    return await fn(item);
  }, Promise.resolve());
}
