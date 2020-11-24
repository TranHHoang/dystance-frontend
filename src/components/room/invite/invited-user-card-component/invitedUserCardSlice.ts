import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { AppThunk } from "~app/store";
import { ErrorResponse, get } from "~utils/index";
import { showInvitedUsers } from "../inviteSlice";

interface InvitedUserCardState {
  roomId: string;
  userId: string;
  isKickConfirmModalOpen: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  error?: ErrorResponse;
}

const initialState: InvitedUserCardState = {
  roomId: null,
  userId: null,
  isKickConfirmModalOpen: false,
  isLoading: false,
  isSuccess: false
};

const invitedUserCardSlice = createSlice({
  name: "invitedUserCardSlice",
  initialState,
  reducers: {
    setKickModalOpen(
      state,
      action: PayloadAction<{ roomId: string; userId: string; isKickConfirmModalOpen: boolean }>
    ) {
      state.roomId = action.payload.roomId;
      state.userId = action.payload.userId;
      state.isKickConfirmModalOpen = action.payload.isKickConfirmModalOpen;
      state.error = undefined;
      state.isSuccess = false;
    },
    kickUserStart(state) {
      state.isLoading = true;
    },
    kickSuccess(state) {
      state.isSuccess = true;
      state.isLoading = false;
    },
    kickFailed(state, action: PayloadAction<ErrorResponse>) {
      state.isSuccess = true;
      state.isLoading = false;
      state.error = action.payload;
    },
    resetInvitedUserState() {
      return initialState;
    }
  }
});

export default invitedUserCardSlice.reducer;
export const {
  setKickModalOpen,
  kickUserStart,
  kickSuccess,
  kickFailed,
  resetInvitedUserState
} = invitedUserCardSlice.actions;

export function kickInvitedUser(roomId: string, userId: string): AppThunk {
  return async (dispatch) => {
    try {
      dispatch(kickUserStart());
      await get(`/rooms/kick?roomId=${roomId}&userId=${userId}`);
      dispatch(kickSuccess());
      dispatch(resetInvitedUserState());
      dispatch(showInvitedUsers(roomId));
    } catch (ex) {
      // Error code != 200
      const e = ex as AxiosError;

      if (e.response) {
        // Server is online, get data from server
        dispatch(kickFailed(e.response.data as ErrorResponse));
      } else if (e.request) {
        // Server is offline/no connection
        dispatch(kickFailed({ message: "Something went wrong", type: 2 }));
      } else {
        dispatch(kickFailed({ message: e.message, type: 3 }));
      }
    }
  };
}
