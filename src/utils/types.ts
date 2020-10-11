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
