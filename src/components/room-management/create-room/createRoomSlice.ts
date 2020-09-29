import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import moment from "moment";
import { AppThunk } from "~app/store";
import { CreateRoomFormValues } from "./CreateRoomForm";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";
import { getLoginData } from "~utils/tokenStorage";
import { showRoom, resetRoom } from "../../homepage/showRoomsSlice";
import { ErrorResponse } from "~utils/types";

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

export function createRoom({
  classroomName,
  startDate,
  startTime,
  endTime,
  endDate,
  description
}: CreateRoomFormValues): AppThunk {
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
      fd.append("creatorId", getLoginData().id);
      fd.append("description", description);
      fd.append("startDate", moment(startDate).format("YYYY-MM-DD"));
      fd.append("endDate", moment(endDate).format("YYYY-MM-DD"));
      fd.append("startHour", startTime);
      fd.append("endHour", endTime);

      await Axios.post(`${hostName}/api/rooms/create`, fd, config);
      dispatch(createRoomSuccess());
      dispatch(resetRoom());
      dispatch(showRoom());
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
