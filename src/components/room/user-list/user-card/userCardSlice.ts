import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { socket } from "../../room-component/roomSlice";
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
  muteOtherUser: boolean;
  kickOtherUser: boolean;
  error?: ErrorResponse;
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
  muteOtherUser: false,
  kickOtherUser: false
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
    actionFailure(state, action: PayloadAction<ErrorResponse>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    setMuteOtherUser(state, action: PayloadAction<boolean>) {
      state.muteOtherUser = action.payload;
    },
    setKickOtherUser(state, action: PayloadAction<boolean>) {
      state.kickOtherUser = action.payload;
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
  actionFailure
} = userCardSlice.actions;

export function muteUser(roomId: string, userId: string): AppThunk {
  return async (dispatch) => {
    try {
      dispatch(muteUserStart());
      await socket.invoke(RoomAction, roomId, RoomActionType.Mute, userId);
      dispatch(muteSuccess());
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(actionFailure(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(actionFailure({ message: "Something Went Wrong" }));
      } else {
        dispatch(actionFailure({ message: ex.message }));
      }
    }
  };
}

export function kickUser(roomId: string, userId: string): AppThunk {
  return async (dispatch) => {
    dispatch(kickUserStart());
    await socket.invoke(RoomAction, roomId, RoomActionType.Kick, userId);
    dispatch(kickSuccess());
  };
}
