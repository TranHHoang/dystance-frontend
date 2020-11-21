import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchLatestMessage } from "../../components/chat/chatSlice";
import { socket } from "~app/App";
import { AppThunk } from "~app/store";
import { getLoginData } from "~utils/tokenStorage";
import { PrivateMessage } from "~utils/types";
import { createNotification, NotificationType } from "~utils/notification";
import { get } from "~utils/axiosUtils";
import { getUser } from "~utils/utility";

interface ChatPreview {
  id: string;
  content: string;
  date: string;
  senderId: string;
  receiverId: string;
  type: number;
  fileName: string;
}
interface ChatPreviewState {
  chatPreview: ChatPreview[];
  privateChatBadge: number;
}
const initialState: ChatPreviewState = {
  chatPreview: [],
  privateChatBadge: 0
};
const chatPreviewSlice = createSlice({
  name: "chatPreview",
  initialState,
  reducers: {
    initPreview(state, action: PayloadAction<ChatPreview[]>) {
      state.chatPreview = action.payload;
    },
    incrementPrivateChatBadge(state) {
      state.privateChatBadge += 1;
    },
    resetPrivateChatBadge(state) {
      state.privateChatBadge = 0;
    }
  }
});

export default chatPreviewSlice.reducer;

export const { initPreview, incrementPrivateChatBadge, resetPrivateChatBadge } = chatPreviewSlice.actions;

export function fetchAllPreview(userId: string): AppThunk {
  return async (dispatch) => {
    try {
      console.log("Fetch all previews");
      const response = await get(`/users/chat/preview?id=${userId}`);
      dispatch(initPreview(response.data));
    } catch (ex) {
      console.log(ex);
    }
  };
}

export function initPrivateChatSocket(): AppThunk {
  return (dispatch) => {
    socket.on(PrivateMessage, (data) => {
      const senderId = JSON.parse(data).senderId;
      const user = getUser(senderId);
      dispatch(incrementPrivateChatBadge());
      dispatch(fetchLatestMessage(undefined, { id1: getLoginData().id, id2: senderId }));
      dispatch(fetchAllPreview(getLoginData().id));
      createNotification(NotificationType.PrivateChat, `New message from ${user.userName}`);
    });
  };
}
