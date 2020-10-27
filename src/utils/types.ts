import NodeCache from "node-cache";
import Axios from "./fakeAPI";
import { hostName } from "./hostUtils";
import { LookupValue } from "react-rainbow-components/components/types";

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
  startHour: string;
  endHour: string;
  repeatOccurrence: string;
  repeatDays: string;
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
  ToggleWhiteboard
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
