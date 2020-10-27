import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { AppThunk } from "~app/store";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";
import { getLoginData } from "~utils/tokenStorage";
import { AllUsersInfo, Room } from "~utils/types";

enum ShowRoomError {
  OtherError = 2
}

interface ErrorResponse {
  type: number;
  message: string;
}

interface ShowRoomState {
  isLoading: boolean;
  rooms: Room[];
  error?: ErrorResponse;
}

const initialState: ShowRoomState = {
  isLoading: true,
  rooms: []
};

const showRoomSlice = createSlice({
  name: "showRoom",
  initialState,
  reducers: {
    fetchRoomSuccess(state, action: PayloadAction<Room[]>) {
      state.isLoading = false;
      state.rooms = state.rooms.concat(action.payload);
    },
    fetchRoomFailed(state, action: PayloadAction<ErrorResponse>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    resetRoom() {
      return initialState;
    }
  }
});

export default showRoomSlice.reducer;
export const { fetchRoomSuccess, fetchRoomFailed, resetRoom } = showRoomSlice.actions;

export function showRoom(): AppThunk {
  return async (dispatch) => {
    try {
      const id = getLoginData().id;
      const response = await Axios.get(`${hostName}/api/Rooms/getByUserId?id=${id}`);
      const data = response.data as Room[];

      dispatch(fetchRoomSuccess(data));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(fetchRoomFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          fetchRoomFailed({
            message: "Something Went Wrong",
            type: ShowRoomError.OtherError
          })
        );
      } else {
        dispatch(
          fetchRoomFailed({
            message: ex.message,
            type: ShowRoomError.OtherError
          })
        );
      }
    }
  };
}

export function fetchAllUsers(): AppThunk {
  return async () => {
    try {
      const response = await Axios.get(`${hostName}/api/users/getAll`);
      sessionStorage.setItem(AllUsersInfo, JSON.stringify(response.data));
    } catch (ex) {
      console.log(ex);
    }
  };
}
