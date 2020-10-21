import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CancelToken } from "axios";
import NodeCache from "node-cache";
import { AppThunk } from "~app/store";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";
import { getLoginData } from "~utils/tokenStorage";
import { RoomAction, RoomActionType, UserInfo } from "~utils/types";
import { socket } from "../room-component/roomSlice";

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

const initialState: ChatMessage[] = [];
const nodeCache = new NodeCache();

const chatSlice = createSlice({
  name: "chatSlice",
  initialState,
  reducers: {
    initChat(state, action: PayloadAction<ChatMessage[]>) {
      state = action.payload;
      return state;
    },
    addChat(state, action: PayloadAction<ChatMessage>) {
      state.push(action.payload);
    }
  }
});

export default chatSlice.reducer;

export const { initChat, addChat } = chatSlice.actions;

export function fetchAllMessages(roomId: string): AppThunk {
  return async (dispatch) => {
    try {
      console.log("Start fetching all...");
      const messages: ChatMessage[] = (await Axios.get(`${hostName}/api/rooms/chat/get?id=${roomId}`)).data;

      dispatch(initChat(messages));
    } catch (ex) {
      // TODO: Check this
      console.log(ex);
    }
  };
}

export function fetchLatestMessage(roomId: string): AppThunk {
  return async (dispatch) => {
    try {
      const response = await Axios.get(`${hostName}/api/rooms/chat/getLast?id=${roomId}`);
      const message: ChatMessage = response.data;
      dispatch(addChat(message));
    } catch (ex) {
      // TODO: Check this
      console.log("Exception: " + ex);
    }
  };
}

export function broadcastMessage(
  roomId: string,
  message: string | File,
  type = ChatType.Text,
  onProgressEvent?: (percentage: number) => void
): AppThunk {
  return async () => {
    try {
      const form = new FormData();
      form.append("roomId", roomId);
      form.append("userId", getLoginData().id);
      form.append("content", message);
      form.append("chatType", type.toString());

      console.log("broadcasting...");
      await Axios.post(`${hostName}/api/rooms/chat/add`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          onProgressEvent(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      });
    } catch (ex) {
      // TODO: Check this later
      console.log(ex);
    }

    socket.invoke(RoomAction, roomId, RoomActionType.Chat, getLoginData().id);
  };
}

export async function getUserInfo(userId: string, cancelToken?: CancelToken): Promise<UserInfo> {
  try {
    if (nodeCache.get(userId)) {
      return nodeCache.get(userId) as UserInfo;
    }
    const response = await Axios.get(`${hostName}/api/users/info?id=${userId}`, { cancelToken: cancelToken });
    nodeCache.set(userId, response.data);
    return response.data as UserInfo;
  } catch (ex) {
    // TODO: Handle this
    console.log(ex);
  }
}
