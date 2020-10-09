import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ErrorResponse } from "~utils/types";

interface JitsiMeetState {
  showUpperToolbar: boolean;
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
    }
  }
});
export default jitsiMeetSlice.reducer;
export const { setShowUpperToolbar } = jitsiMeetSlice.actions;
