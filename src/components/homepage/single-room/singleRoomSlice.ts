import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import _ from "lodash";
import moment from "moment";
import { AppThunk } from "~app/store";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";
import { getLoginData } from "~utils/tokenStorage";
import { ErrorResponse, Room } from "~utils/types";
import { showRoom } from "../showRoomsSlice";
import { UpdateRoomFormValues } from "./SingleRoomUpdateForm";
interface SingleRoomState {
  roomId: string;
  isLoading: boolean;
  isUpdateModalOpen: boolean;
  isConfirmDeleteModalOpen: boolean;
  isUpdateSuccess: boolean;
  isDeleteSuccess: boolean;
  room: Room;
  error?: ErrorResponse;
  updateRepeatToggle: boolean;
}

const initialState: SingleRoomState = {
  roomId: null,
  isLoading: false,
  isUpdateModalOpen: false,
  isConfirmDeleteModalOpen: false,
  isUpdateSuccess: false,
  room: null,
  isDeleteSuccess: false,
  updateRepeatToggle: false
};

const singleRoomSlice = createSlice({
  name: "singleRoom",
  initialState,
  reducers: {
    setUpdateModalOpen(state, action: PayloadAction<{ roomId: string; isUpdateModalOpen: boolean }>) {
      state.roomId = action.payload.roomId;
      state.isUpdateModalOpen = action.payload.isUpdateModalOpen;
      state.isUpdateSuccess = false;
      state.error = undefined;
    },
    setConfirmDeleteModalOpen(state, action: PayloadAction<{ roomId: string; isConfirmDeleteModalOpen: boolean }>) {
      state.roomId = action.payload.roomId;
      state.isConfirmDeleteModalOpen = action.payload.isConfirmDeleteModalOpen;
      state.isDeleteSuccess = false;
      state.error = undefined;
    },
    deleteRoomStart(state) {
      state.isLoading = true;
    },
    updateRoomStart(state) {
      state.isLoading = true;
    },
    deleteRoomSuccess(state) {
      state.isLoading = false;
      state.isDeleteSuccess = true;
      state.isConfirmDeleteModalOpen = false;
    },
    deleteRoomFailed(state, action: PayloadAction<ErrorResponse>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateRoomSuccess(state) {
      state.isLoading = false;
      state.isUpdateSuccess = true;
      state.isUpdateModalOpen = false;
    },
    updateRoomFailed(state, action: PayloadAction<ErrorResponse>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    setUpdateRepeatToggle(state, action: PayloadAction<boolean>) {
      state.updateRepeatToggle = action.payload;
    },
    resetState() {
      return initialState;
    }
  }
});

export default singleRoomSlice.reducer;
export const {
  setConfirmDeleteModalOpen,
  deleteRoomStart,
  resetState,
  deleteRoomFailed,
  setUpdateRepeatToggle,
  deleteRoomSuccess,
  setUpdateModalOpen,
  updateRoomStart,
  updateRoomSuccess,
  updateRoomFailed
} = singleRoomSlice.actions;

export function deleteRoom(roomId: string): AppThunk {
  return async (dispatch) => {
    try {
      dispatch(deleteRoomStart());
      await Axios.delete(`${hostName}/api/rooms?id=${roomId}`);
      dispatch(deleteRoomSuccess());
      dispatch(showRoom());
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(deleteRoomFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(deleteRoomFailed({ message: "Something Went Wrong", type: 2 }));
      } else {
        dispatch(deleteRoomFailed({ message: ex.message, type: 3 }));
      }
    }
  };
}

export function updateRoom({
  roomId,
  classroomName,
  startDate,
  endDate,
  description,
  repeatOccurrence,
  roomImage,
  roomTime
}: UpdateRoomFormValues): AppThunk {
  return async (dispatch) => {
    dispatch(updateRoomStart());
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
      fd.append("roomId", roomId);
      fd.append("name", classroomName);
      fd.append("creatorId", getLoginData().id);
      fd.append("description", description);
      fd.append("startDate", moment(startDate).format("YYYY-MM-DD"));
      fd.append("repeatOccurrence", repeatOccurrence.name);
      fd.append("endDate", moment(endDate).format("YYYY-MM-DD"));
      fd.append("roomImage", roomImage);
      fd.append("roomTimes", JSON.stringify(roomTimes));

      await Axios.post(`${hostName}/api/rooms/update`, fd, config);
      dispatch(updateRoomSuccess());
      dispatch(resetState());
      dispatch(showRoom());
    } catch (ex) {
      // Error code != 200
      const e = ex as AxiosError;

      if (e.response) {
        // Server is online, get data from server
        dispatch(updateRoomFailed(e.response.data as ErrorResponse));
      } else if (e.request) {
        // Server is offline/no connection
        dispatch(updateRoomFailed({ message: "Something went wrong", type: 2 }));
      } else {
        dispatch(updateRoomFailed({ message: e.message, type: 3 }));
      }
    }
  };
}
