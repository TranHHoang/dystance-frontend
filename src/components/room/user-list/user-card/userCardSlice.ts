import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { socket } from "~app/App";
import { AppThunk } from "~app/store";
import { RoomAction, RoomActionType } from "~utils/types";

interface ErrorResponse {
  message: string;
}

interface UserCardState {
  userId: string;
  isKickModalOpen: boolean;
  isMuteModalOpen: boolean;
  isRemoteControlOfferModalOpen: boolean;
  isRemoteControlWaitingModalOpen: boolean;
  isLoading: boolean;
  isKickSuccess: boolean;
  isMuteSuccess: boolean;
  isAllowWhiteboardSuccess: boolean;
  muteOtherUser: boolean;
  kickOtherUser: boolean;
  allowWhiteboard: boolean;
  error?: ErrorResponse;
  userWhiteboard: { [key: string]: boolean };
}
const initialState: UserCardState = {
  userId: null,
  isKickModalOpen: false,
  isMuteModalOpen: false,
  isRemoteControlOfferModalOpen: false,
  isRemoteControlWaitingModalOpen: false,
  isLoading: false,
  isKickSuccess: false,
  isMuteSuccess: false,
  isAllowWhiteboardSuccess: false,
  muteOtherUser: false,
  kickOtherUser: false,
  allowWhiteboard: false,
  userWhiteboard: {}
};
const userCardSlice = createSlice({
  name: "userCardSlice",
  initialState,
  reducers: {
    setKickModalOpen(state, action: PayloadAction<{ userId: string; isKickModalOpen: boolean }>) {
      state.userId = action.payload.userId;
      state.isKickModalOpen = action.payload.isKickModalOpen;
      state.isKickSuccess = false;
      state.error = undefined;
    },
    setMuteModalOpen(state, action: PayloadAction<{ userId: string; isMuteModalOpen: boolean }>) {
      state.userId = action.payload.userId;
      state.isMuteModalOpen = action.payload.isMuteModalOpen;
      state.isMuteSuccess = false;
      state.error = undefined;
    },
    setRemoteControlOfferModalOpen(state, action: PayloadAction<{ userId: string; isModalOpen: boolean }>) {
      state.userId = action.payload.userId;
      state.isRemoteControlOfferModalOpen = action.payload.isModalOpen;
    },
    setRemoteControlWaitingModalOpen(state, action: PayloadAction<{ userId: string; isModalOpen: boolean }>) {
      state.userId = action.payload.userId;
      state.isRemoteControlWaitingModalOpen = action.payload.isModalOpen;
    },
    allowWhiteboardStart(state) {
      state.isLoading = true;
    },
    kickUserStart(state) {
      state.isLoading = true;
    },
    muteUserStart(state) {
      state.isLoading = true;
    },
    muteSuccess(state) {
      state.isLoading = false;
      state.isMuteSuccess = true;
      state.isMuteModalOpen = false;
    },
    kickSuccess(state) {
      state.isLoading = false;
      state.isKickSuccess = true;
      state.isKickModalOpen = false;
    },
    allowWhiteboardSuccess(state) {
      state.isLoading = false;
      state.isAllowWhiteboardSuccess = true;
    },
    setMuteOtherUser(state, action: PayloadAction<boolean>) {
      state.muteOtherUser = action.payload;
    },
    setKickOtherUser(state, action: PayloadAction<boolean>) {
      state.kickOtherUser = action.payload;
    },
    toggleWhiteboard(state) {
      state.allowWhiteboard = !state.allowWhiteboard;
    },
    toggleUserWhiteboard(state, action: PayloadAction<string>) {
      state.userWhiteboard[action.payload] = !state.userWhiteboard[action.payload];
    },
    resetCardState() {
      return initialState;
    }
  }
});
export default userCardSlice.reducer;
export const {
  setKickOtherUser,
  setMuteOtherUser,
  setKickModalOpen,
  setMuteModalOpen,
  setRemoteControlOfferModalOpen,
  setRemoteControlWaitingModalOpen,
  kickUserStart,
  muteUserStart,
  muteSuccess,
  kickSuccess,
  allowWhiteboardStart,
  toggleWhiteboard,
  allowWhiteboardSuccess,
  resetCardState,
  toggleUserWhiteboard
} = userCardSlice.actions;

export function muteUser(roomId: string, userId: string): AppThunk {
  return async (dispatch) => {
    dispatch(muteUserStart());
    await socket.invoke(RoomAction, roomId, RoomActionType.Mute, userId);
    dispatch(muteSuccess());
  };
}

export function kickUser(roomId: string, userId: string): AppThunk {
  return async (dispatch) => {
    dispatch(kickUserStart());
    await socket.invoke(RoomAction, roomId, RoomActionType.Kick, userId);
    dispatch(kickSuccess());
  };
}
export function toggleWhiteboardUsage(roomId: string, userId: string): AppThunk {
  return async (dispatch) => {
    await socket.invoke(RoomAction, roomId, RoomActionType.ToggleWhiteboard, userId);
    dispatch(toggleUserWhiteboard(userId));
  };
}
