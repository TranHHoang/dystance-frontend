import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchLatestMessage } from "../../components/chat/chatSlice";
import { socket } from "~app/App";
import { AppThunk } from "~app/store";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";
import { getLoginData } from "~utils/tokenStorage";
import { PrivateMessage } from "~utils/types";

interface ChatPreview {
  id: string;
  content: string;
  date: string;
  senderId: string;
  receiverId: string;
  type: number;
  fileName: string;
}

const chatPreviewSlice = createSlice({
  name: "chatPreview",
  initialState: [] as ChatPreview[],
  reducers: {
    initPreview(state, action: PayloadAction<ChatPreview[]>) {
      state = action.payload;
      return state;
    }
  }
});

export default chatPreviewSlice.reducer;

export const { initPreview } = chatPreviewSlice.actions;

export function fetchAllPreview(userId: string): AppThunk {
  return async (dispatch) => {
    try {
      console.log("Fetch all previews");
      const response = await Axios.get(`${hostName}/api/users/chat/preview?id=${userId}`);

      dispatch(initPreview(response.data));
    } catch (ex) {
      // TODO: Check this
      console.log(ex);
    }
  };
}

export function initSocket(): AppThunk {
  return (dispatch) => {
    socket.on(PrivateMessage, (data) => {
      console.log("received", data);
      const senderId = JSON.parse(data).senderId;
      dispatch(fetchLatestMessage(undefined, { id1: getLoginData().id, id2: senderId }));
      dispatch(fetchAllPreview(getLoginData().id));
    });
  };
}
