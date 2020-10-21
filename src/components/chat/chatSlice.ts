import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "~app/store";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";
import { getLoginData } from "~utils/tokenStorage";
import { NotificationAction, NotificationActionType, RoomAction, RoomActionType } from "~utils/types";
import { socket } from "~app/App";

export enum ChatType {
  Text,
  Image,
  File
}

interface ChatMessage {
  id: string;
  roomId: string;
  type: ChatType;
  userId: string;
  date: string;
  content: string;
  fileName?: string;
}

interface ChatState {
  roomChat: ChatMessage[];
  privateChat: ChatMessage[];
}

const initialState: ChatState = {
  roomChat: [],
  privateChat: []
};

const chatSlice = createSlice({
  name: "chatSlice",
  initialState,
  reducers: {
    initChat(state, action: PayloadAction<{ type: "room" | "private"; content: ChatMessage[] }>) {
      if (action.payload.type === "room") {
        state.roomChat = action.payload.content;
      } else {
        state.privateChat = action.payload.content;
      }
    },
    addChat(state, action: PayloadAction<{ type: "room" | "private"; content: ChatMessage }>) {
      if (action.payload.type === "room") {
        state.roomChat.push(action.payload.content);
      } else {
        state.privateChat.push(action.payload.content);
      }
    }
  }
});

export default chatSlice.reducer;

export const { initChat, addChat } = chatSlice.actions;

export function fetchAllMessages(roomId: string, userId: string): AppThunk {
  return async (dispatch) => {
    try {
      console.log("Start fetching all...");
      const messages: ChatMessage[] = (
        await Axios.get(`${hostName}/api/${roomId ? "rooms/chat/" : "users/chat/"}/get?id=${roomId || userId}`)
      ).data;

      dispatch(initChat({ type: roomId ? "room" : "private", content: messages }));
    } catch (ex) {
      // TODO: Check this
      console.log(ex);
    }
  };
}

export function fetchLatestMessage(roomId: string, userId: string): AppThunk {
  return async (dispatch) => {
    try {
      const response = await Axios.get(
        `${hostName}/api/${roomId ? "rooms/chat/" : "users/chat/"}/getLast?id=${roomId || userId}`
      );
      const message: ChatMessage = response.data;
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
  return async () => {
    try {
      const form = new FormData();

      if (roomId) {
        // Send to room
        form.append("roomId", roomId);
      } else if (receiverId) {
        // Send to userId
        form.append("receiverId", receiverId);
      }
      form.append("userId", getLoginData().id);
      form.append("content", message);
      form.append("chatType", type.toString());

      console.log("broadcasting...");
      await Axios.post(`${hostName}/api/${roomId ? "rooms" : "users"}/chat/add`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          onProgressEvent(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      });
    } catch (ex) {
      // TODO: Check this later
      console.log(ex);
    }

    if (roomId) {
      socket.invoke(RoomAction, roomId, RoomActionType.Chat, getLoginData().id);
    } else {
      socket.invoke(NotificationAction, NotificationActionType.Chat, getLoginData().id, receiverId);
    }
  };
}
