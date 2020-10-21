import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "~app/store";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";
import { getLoginData } from "~utils/tokenStorage";
import { PrivateMessage, RoomAction, RoomActionType } from "~utils/types";
import { socket } from "~app/App";
import { fetchAllPreview } from "../../components/private-chat/chatPreviewSlice";

export enum ChatType {
  Text,
  Image,
  File
}

interface ChatMessage {
  id: string;
  type: ChatType;
  date: string;
  content: string;
  fileName?: string;
}

export interface RoomMessage extends ChatMessage {
  roomId: string;
  userId: string;
}

export interface PrivateMessage extends ChatMessage {
  senderId: string;
}

interface ChatState {
  roomChat: RoomMessage[];
  privateChat: PrivateMessage[];
}

const initialState: ChatState = {
  roomChat: [],
  privateChat: []
};

const chatSlice = createSlice({
  name: "chatSlice",
  initialState,
  reducers: {
    initChat(state, action: PayloadAction<{ type: "room" | "private"; content: RoomMessage[] | PrivateMessage[] }>) {
      if (action.payload.type === "room") {
        state.roomChat = action.payload.content as RoomMessage[];
      } else {
        state.privateChat = action.payload.content as PrivateMessage[];
      }
    },
    addChat(state, action: PayloadAction<{ type: "room" | "private"; content: RoomMessage | PrivateMessage }>) {
      if (action.payload.type === "room") {
        state.roomChat.push(action.payload.content as RoomMessage);
      } else {
        state.privateChat.push(action.payload.content as PrivateMessage);
      }
    }
  }
});

export default chatSlice.reducer;

export const { initChat, addChat } = chatSlice.actions;

export function fetchAllMessages(roomId: string, privateChat: { id1: string; id2: string }): AppThunk {
  return async (dispatch) => {
    try {
      console.log("Start fetching all...");
      const messages = (
        await Axios.get(
          `${hostName}/api/${
            roomId ? `rooms/chat/get?id=${roomId}` : `users/chat/get?id1=${privateChat.id1}&id2=${privateChat.id2}`
          }`
        )
      ).data as RoomMessage[] | PrivateMessage[];

      dispatch(initChat({ type: roomId ? "room" : "private", content: messages }));
    } catch (ex) {
      // TODO: Check this
      console.log(ex);
    }
  };
}

export function fetchLatestMessage(roomId: string, privateChat: { id1: string; id2: string }): AppThunk {
  return async (dispatch) => {
    try {
      const message = (
        await Axios.get(
          `${hostName}/api/${
            roomId
              ? `rooms/chat/getLast?id=${roomId}`
              : `users/chat/getLast?id1=${privateChat.id1}&id2=${privateChat.id2}`
          }`
        )
      ).data as RoomMessage | PrivateMessage;
      dispatch(addChat({ type: roomId ? "room" : "private", content: message }));
    } catch (ex) {
      // TODO: Check this
      console.log("Exception: " + ex);
    }
  };
}

export function broadcastMessage(
  roomId: string,
  receiverId: string,
  message: string | File,
  type = ChatType.Text,
  onProgressEvent?: (percentage: number) => void
): AppThunk {
  return async (dispatch) => {
    try {
      const form = new FormData();

      if (roomId) {
        // Send to room
        form.append("roomId", roomId);
        form.append("userId", getLoginData().id);
      } else if (receiverId) {
        // Send to userId
        form.append("senderId", getLoginData().id);
        form.append("receiverId", receiverId);
      }

      form.append("content", message);
      form.append("chatType", type.toString());

      console.log("broadcasting...");
      await Axios.post(`${hostName}/api/${roomId ? "rooms" : "users"}/chat/add`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          console.log(progressEvent);
          console.log(onProgressEvent);
          onProgressEvent?.call(this, Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      });
    } catch (ex) {
      // TODO: Check this later
      console.log(ex);
    }

    if (roomId) {
      socket.invoke(RoomAction, roomId, RoomActionType.Chat, getLoginData().id);
    } else {
      await socket.invoke(PrivateMessage, getLoginData().id, receiverId);
      dispatch(fetchLatestMessage(undefined, { id1: getLoginData().id, id2: receiverId }));
      dispatch(fetchAllPreview(getLoginData().id));
    }
  };
}

export function isPrivateMessage(message: RoomMessage | PrivateMessage): message is PrivateMessage {
  return (message as PrivateMessage).senderId !== undefined;
}
