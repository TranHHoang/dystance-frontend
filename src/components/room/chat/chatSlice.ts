import { HubConnectionBuilder } from "@microsoft/signalr";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Axios from "~utils/fakeAPI";
import { AppThunk } from "~app/store";
import { hostName } from "~utils/hostUtils";
import { getLoginData } from "~utils/tokenStorage";

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

const chatSlice = createSlice({
  name: "chatSlice",
  initialState,
  reducers: {
    initChat(state, action: PayloadAction<ChatMessage[]>) {
      state = action.payload;
      console.log(state);
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

function fetchLatestMessage(roomId: string): AppThunk {
  return async (dispatch) => {
    try {
      const response = await Axios.get(`${hostName}/api/rooms/chat/getLast?id=${roomId}`);
      const message: ChatMessage = response.data;
      dispatch(addChat(message));
    } catch (ex) {
      // TODO: Check this
      console.log("EX: " + ex);
    }
  };
}

const socket = new HubConnectionBuilder().withUrl(`${hostName}/socket`).build();

export function initSocket(roomId: string): AppThunk {
  return async (dispatch) => {
    console.log("Start socket...");
    await socket.start();
    await socket.invoke("AddToGroup", roomId);

    socket.on("Broadcast", () => {
      dispatch(fetchLatestMessage(roomId));
    });
  };
}

export function broadcastMessage(roomId: string, message: string | File, type = ChatType.Text): AppThunk {
  return async () => {
    try {
      const form = new FormData();
      form.append("roomId", roomId);
      form.append("userId", getLoginData().id);
      form.append("content", message);
      form.append("chatType", type.toString());

      console.log("broadcasting...");
      await Axios.post(`${hostName}/api/rooms/chat/add`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    } catch (ex) {
      // TODO: Check this later
      console.log(ex);
    }

    socket.invoke("Broadcast", roomId);
  };
}

export function removeListeners() {
  socket.off("Broadcast");
}
