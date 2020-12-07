import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import _ from "lodash";
import { AppThunk } from "~app/store";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";
import { AllUsersInfo, ErrorResponse, User } from "~utils/types";

interface InviteState {
  roomId: string;
  isModalOpen: boolean;
  isLoading: boolean;
  isSuccess?: boolean;
  error?: ErrorResponse;
  usersInRoom: User[];
}

const initialState: InviteState = {
  roomId: null,
  isModalOpen: false,
  isLoading: false,
  usersInRoom: []
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
    },
    getUsersInRoomSuccess(state, action: PayloadAction<User[]>) {
      state.usersInRoom = action.payload;
    },
    getUsersInRoomFailed(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    }
  }
});

export default inviteSlice.reducer;

export const {
  setInviteModalOpen,
  inviteStart,
  inviteSuccess,
  inviteFailed,
  getUsersInRoomSuccess,
  getUsersInRoomFailed
} = inviteSlice.actions;

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

export function showInvitedUsers(roomId: string): AppThunk {
  return async (dispatch) => {
    try {
      const allUsersInfo = JSON.parse(sessionStorage.getItem(AllUsersInfo)) as User[];
      const response = await Axios.get(`${hostName}/api/rooms/getUsers?id=${roomId}`);
      dispatch(getUsersInRoomSuccess(_.map(response.data, (id) => _.find(allUsersInfo, { id }))));
    } catch (ex) {
      const e = ex as AxiosError;

      if (e.response?.data) {
        dispatch(getUsersInRoomFailed(e.response.data as ErrorResponse));
      } else if (e.request) {
        dispatch(
          getUsersInRoomFailed({
            type: 2,
            message: "Something Went Wrong"
          })
        );
      } else {
        dispatch(
          getUsersInRoomFailed({
            type: 3,
            message: e.message
          })
        );
      }
    }
  };
}
