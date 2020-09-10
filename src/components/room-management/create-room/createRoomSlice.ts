import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError, AxiosResponse } from "axios";
import { AppThunk } from "../../../app/store";
import Axios from "./createRoomFakeAPI";

interface ErrorResponse {
  type: number;
  message: string;
}

interface CreateRoomState {
  isLoading: boolean;
  isModalOpen: boolean;
  isCreationSuccess: boolean;
  error?: ErrorResponse;
}

const initialState: CreateRoomState = {
  // Use to update react component
  isLoading: false,
  isModalOpen: false,
  isCreationSuccess: false
};

const createRoomSlice = createSlice({
  name: "createRoom",
  initialState,
  reducers: {
    setRoomCreateModalOpen(state, action: PayloadAction<boolean>) {
      state.isModalOpen = action.payload;
      state.isCreationSuccess = false;
      state.error = undefined;
    },
    roomCreateStart(state) {
      state.isLoading = true;
    },
    createRoomSuccess(state) {
      // Call when async response is ok
      state.isLoading = false;
      state.isCreationSuccess = true;
      state.error = undefined;
    },
    createRoomFailed(state, action: PayloadAction<ErrorResponse>) {
      state.isLoading = false;
      state.error = action.payload;
    }
  }
});

export default createRoomSlice.reducer;
export const { roomCreateStart, createRoomSuccess, createRoomFailed, setRoomCreateModalOpen } = createRoomSlice.actions;

function formatDate(date: Date): string {
  function pad(n: number) {
    return n < 10 ? "0" + n : n;
  }

  return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join("-");
}

export function createRoom(
  classroomName: string,
  startDate: Date,
  startTime: string,
  endTime: string,
  endDate: Date,
  description: string
): AppThunk {
  return async (dispatch) => {
    dispatch(roomCreateStart());
    try {
      const fd = new FormData();
      const config = {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      };
      fd.append("name", classroomName);
      fd.append("description", description);
      fd.append("startDate", formatDate(startDate));
      fd.append("endDate", formatDate(endDate));
      fd.append("startHour", startTime);
      fd.append("endHour", endTime);

      await Axios.post("/api/rooms/create", fd, config);
      dispatch(createRoomSuccess());
    } catch (ex) {
      // Error code != 200
      const e = ex as AxiosError;

      if (e.response) {
        // Server is online, get data from server
        dispatch(createRoomFailed(e.response.data as ErrorResponse));
      } else if (e.request) {
        // Server is offline/no connection
        dispatch(createRoomFailed({ message: "Something went wrong", type: 2 }));
      } else {
        dispatch(createRoomFailed({ message: e.message, type: 2 }));
      }
    }
  };
}
