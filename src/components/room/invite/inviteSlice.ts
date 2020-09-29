import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "~app/store";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";
import { ErrorResponse } from "~utils/types";

interface InviteState {
  roomId: string;
  isModalOpen: boolean;
  isLoading: boolean;
  isSuccess?: boolean;
  error?: ErrorResponse;
}

const initialState: InviteState = {
  roomId: null,
  isModalOpen: false,
  isLoading: false
};

const inviteSlice = createSlice({
  name: "inviteSlice",
  initialState,
  reducers: {
    setInviteModalOpen(state, action: PayloadAction<{ roomId: string; isModalOpen: boolean }>) {
      state.roomId = action.payload.roomId;
      state.isModalOpen = action.payload.isModalOpen;
      state.isSuccess = false;
      state.error = undefined;
    },
    inviteStart(state) {
      state.isLoading = true;
    },
    inviteSuccess(state) {
      state.isLoading = false;
      state.isSuccess = true;
      state.isModalOpen = false;
    },
    inviteFailed(state, action: PayloadAction<ErrorResponse>) {
      state.isLoading = false;
      state.isSuccess = false;
      state.error = action.payload;
    }
  }
});

export default inviteSlice.reducer;

export const { setInviteModalOpen, inviteStart, inviteSuccess, inviteFailed } = inviteSlice.actions;

export function startInvite(roomId: string, emails: string[], message: string): AppThunk {
  return async (dispatch) => {
    try {
      dispatch(inviteStart());
      const form = new FormData();
      form.append("roomId", roomId);
      form.append("emailList", emails.join(","));
      form.append("message", message ?? "");

      await Axios.post(`${hostName}/api/rooms/invite`, form, {
        headers: {
          "Content-Type": "multipart/formdata"
        }
      });

      dispatch(inviteSuccess());
    } catch (ex) {
      dispatch(inviteFailed());
    }
  };
}
