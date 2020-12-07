import moment from "moment";
import { getLoginData } from "./tokenStorage";

export enum LogType {
  AttendanceJoin = "ATTENDANCE_JOIN",
  AttendanceLeave = "ATTENDANCE_LEAVE",
  PrivateChatImage = "PRIVATE_CHAT_IMAGE",
  PrivateChatFile = "PRIVATE_CHAT_FILE",
  PrivateChatText = "PRIVATE_CHAT_TEXT",
  RoomChatImage = "ROOM_CHAT_IMAGE",
  RoomChatFile = "ROOM_CHAT_FILE",
  RoomChatText = "ROOM_CHAT_TEXT",
  Kick = "KICK",
  GotKicked = "GOT_KICKED",
  Mute = "MUTE",
  GotMuted = "GOT_MUTED",
  ToggleWhiteboard = "TOGGLE_WHITEBOARD",
  RemoteControlPermission = "REMOTE_CONTROL_PERMISSION",
  RemoteControlAccept = "REMOTE_CONTROL_ACCEPT",
  RemoteControlReject = "REMOTE_CONTROL_REJECT",
  RemoteControlStop = "REMOTE_CONTROL_STOP",
  WhiteboardAllow = "WHITEBOARD_ALLOW",
  WhiteboardDisable = "WHITEBOARD_DISABLE",
  GroupCreate = "GROUP_CREATE",
  GroupDelete = "GROUP_DELETE",
  GroupStart = "GROUP_START",
  GroupStop = "GROUP_STOP",
  GroupJoin = "GROUP_JOIN",
  GroupLeave = "GROUP_LEAVE",
  ShareScreenStart = "SCREEN_SHARE_START",
  ShareScreenStop = "SCREEN_SHARE_STOP"
}

export class Logger {
  private logs: string[];
  private static instance: Logger;

  private constructor() {
    this.logs = [];
  }
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  public getLogs() {
    return this.logs;
  }
  public resetLogs() {
    this.logs = [];
  }
  //2020-12-12T12:00:00 ATTENDANCE 1231-4322f-7765y5r Enter room id = 12
  public log(type: string, roomId: string, description: string): void {
    const log = `${moment().format("YYYY-MM-DDTHH:mm:ss")} ${type} ${roomId} ${getLoginData().id} ${description}`;
    this.logs.push(log);
    console.log(this.logs);
  }
}
