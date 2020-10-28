import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import moment from "moment";
import { AppThunk } from "~app/store";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";
import { getLoginData } from "~utils/tokenStorage";
import { ErrorResponse } from "~utils/types";
import { resetRoom, showRoom } from "../../homepage/showRoomsSlice";
import { CreateRoomFormValues } from "./CreateRoomForm";
import _ from "lodash";

interface CreateRoomState {
  isLoading: boolean;
  isModalOpen: boolean;
  isCreationSuccess: boolean;
  repeatToggle: boolean;
  error?: ErrorResponse;
}

const initialState: CreateRoomState = {
  // Use to update react component
  isLoading: false,
  isModalOpen: false,
  isCreationSuccess: false,
  repeatToggle: false
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
    },
    setRepeatToggle(state, action: PayloadAction<boolean>) {
      state.repeatToggle = action.payload;
    },
    resetCreateRoomState() {
      return initialState;
    }
  }
});

export default createRoomSlice.reducer;
export const {
  setRepeatToggle,
  roomCreateStart,
  createRoomSuccess,
  createRoomFailed,
  setRoomCreateModalOpen,
  resetCreateRoomState
} = createRoomSlice.actions;

export function createRoom({
  classroomName,
  startDate,
  endDate,
  description,
  repeatOccurrence,
  roomTime
}: CreateRoomFormValues): AppThunk {
  return async (dispatch) => {
    dispatch(roomCreateStart());
    const roomTimes = _.map(roomTime, (value, key) => ({
      dayOfWeek: key,
      ...value
    }));

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
      fd.append("repeatOccurrence", repeatOccurrence.name);
      fd.append("roomTimes", JSON.stringify(roomTimes));
      fd.append("endDate", moment(endDate).format("YYYY-MM-DD"));

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
        dispatch(createRoomFailed({ message: e.message, type: 3 }));
      }
    }
  };
}
