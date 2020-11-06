import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { post } from "jquery";
import { AppThunk } from "~app/store";
import { getLoginData } from "~utils/tokenStorage";
import { ErrorResponse } from "~utils/types";

interface JitsiMeetState {
  showUpperToolbar: boolean;
  error?: ErrorResponse;
}
const initialState: JitsiMeetState = {
  showUpperToolbar: false
};

const jitsiMeetSlice = createSlice({
  name: "jitsiMeetSlice",
  initialState,
  reducers: {
    setShowUpperToolbar(state, action: PayloadAction<boolean>) {
      state.showUpperToolbar = action.payload;
    },
    sendLogFailed(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    }
  }
});
export default jitsiMeetSlice.reducer;
export const { setShowUpperToolbar, sendLogFailed } = jitsiMeetSlice.actions;

export function sendLog(logFile: File): AppThunk {
  return async (dispatch) => {
    try {
      const fd = new FormData();
      fd.append("userId", getLoginData().id);
      fd.append("log", logFile);
      await post("/users/log", fd);
    } catch (ex) {
      // Error code != 200
      const e = ex as AxiosError;

      if (e.response) {
        // Server is online, get data from server
        dispatch(sendLogFailed(e.response.data as ErrorResponse));
      } else if (e.request) {
        // Server is offline/no connection
        dispatch(sendLogFailed({ message: "Something went wrong", type: 2 }));
      } else {
        dispatch(sendLogFailed({ message: e.message, type: 3 }));
      }
    }
  };
}
