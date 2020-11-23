export type Role = "student" | "teacher" | "admin" | "quality assurance" | "academic management";
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

export interface ErrorResponse {
  type: number;
  message: string;
}

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

export interface RoomTimes {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
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
  role: Role;
}

export interface Semester {
  id: string;
  name: string;
}

export interface ActivityLog {
  dateTime: string;
  logType: string;
  roomId: string;
  userId: string;
  description: string;
}

export interface Room {
  roomId: string;
  roomName: string;
  teacherId: string;
}
