import { ipcRenderer } from "electron";

export enum NotificationType {
  RoomNotification = "Room Notification",
  PrivateChat = "Private Message",
  IncomingClass = "Incoming class",
  IncomingDeadline = "Incoming deadline"
}

export function createNotification(type: NotificationType, content: string) {
  new Notification(type, {
    body: content,
    icon: "../assets/logo.png",
    timestamp: new Date().getTime()
  }).addEventListener("click", () => {
    ipcRenderer.send("restore-and-focus");
  });
}
