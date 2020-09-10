import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError, AxiosResponse } from "axios";
import { AppThunk } from "../../app//store";
import { getFormInitialValues } from "redux-form";
import Axios from "./HomepageFakeAPI";

enum ShowRoomError {
  OtherError = 2
}
interface ErrorResponse {
  type: number;
  message: string;
}
interface Room {
  id: string;
  name: string;
  creatorId: string;
  image: string;
  description: string;
  startDate: string;
  endDate: string;
  startHour: string;
  endHour: string;
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
    }
  }
});

export default showRoomSlice.reducer;
export const { fetchRoomSuccess, fetchRoomFailed } = showRoomSlice.actions;

export function showRoom(): AppThunk {
  return async (dispatch) => {
    try {
      const response = await Axios.get("/api/rooms/getByUserId?id=1");
      const data = response.data as Room[];
      console.log(data);

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
