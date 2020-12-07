import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RemoteControlState {
  userId: string;
  remoteControlAccepted: boolean;
}

const initialState: RemoteControlState = {
  userId: null,
  remoteControlAccepted: undefined
};

const remoteControlSlice = createSlice({
  name: "remoteControlSlice",
  initialState,
  reducers: {
    setRemoteControlAccepted(state, action: PayloadAction<boolean>) {
      state.remoteControlAccepted = action.payload;
    },
    setUserId(state, action: PayloadAction<string>) {
      state.userId = action.payload;
    }
  }
});

export default remoteControlSlice.reducer;
export const { setRemoteControlAccepted, setUserId } = remoteControlSlice.actions;
