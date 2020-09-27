import { createSlice } from "@reduxjs/toolkit";
import { AppThunk } from "~app/store";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";

interface InviteState {
  isLoading: boolean;
  isSuccess?: boolean;
}

const initialState: InviteState = {
  isLoading: false
};

const inviteSlice = createSlice({
  name: "inviteSlice",
  initialState,
  reducers: {
    inviteStart(state) {
      state.isLoading = true;
    },
    inviteSuccess(state) {
      state.isLoading = false;
      state.isSuccess = true;
    },
    inviteFailed(state) {
      state.isLoading = false;
      state.isSuccess = false;
    }
  }
});

export default inviteSlice.reducer;

const { inviteStart, inviteSuccess, inviteFailed } = inviteSlice.actions;

export function startInvite(roomId: string, emails: string[]): AppThunk {
  return async (dispatch) => {
    try {
      dispatch(inviteStart());
      const form = new FormData();
      form.append("roomId", roomId);
      form.append("emailList", emails.join(","));

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
