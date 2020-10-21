import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RemoteControlState {
  remoteControlAccepted: boolean;
}

const initialState: RemoteControlState = {
  remoteControlAccepted: undefined
};

const remoteControlSlice = createSlice({
  name: "remoteControlSlice",
  initialState,
  reducers: {
    setRemoteControlAccepted(state, action: PayloadAction<boolean>) {
      state.remoteControlAccepted = action.payload;
    }
  }
});

export default remoteControlSlice.reducer;
export const { setRemoteControlAccepted } = remoteControlSlice.actions;
