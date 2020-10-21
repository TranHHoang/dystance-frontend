import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "~app/store";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";

interface ChatPreview {
  userId: string;
  lastChat: string;
  lastDate: Date;
}

const chatPreviewSlice = createSlice({
  name: "chatPreview",
  initialState: [] as ChatPreview[],
  reducers: {
    initPreview(state, action: PayloadAction<ChatPreview[]>) {
      state = action.payload;
      return state;
    },
    addPreview(state, action: PayloadAction<ChatPreview>) {
      // Remove existing preview
      if (state.find((preview) => preview.userId === action.payload.userId)) {
        const index = state.findIndex((preview) => preview.userId === action.payload.userId);
        state.splice(index, 1);
      }
      state.push(action.payload);
    }
  }
});

export default chatPreviewSlice.reducer;

export const { initPreview, addPreview } = chatPreviewSlice.actions;

export function fetchAllPreview(userId: string): AppThunk {
  return async (dispatch) => {
    try {
      const response = await Axios.get(`${hostName}/api/users/chat/preview?id=${userId}`);

      dispatch(initPreview(response.data));
    } catch (ex) {
      // TODO: Check this
      console.log(ex);
    }
  };
}

export function fetchLatestPreview(userId: string): AppThunk {
  return async (dispatch) => {
    try {
      const response = await Axios.get(`${hostName}/api/users/chat/lastPreview?id=${userId}`);

      dispatch(addPreview(response.data));
    } catch (ex) {
      // TODO: Check this
      console.log(ex);
    }
  };
}
