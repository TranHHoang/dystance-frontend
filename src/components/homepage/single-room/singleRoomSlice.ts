import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { AppThunk } from "~app/store";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";
import { resetRoom, showRoom } from "../showRoomsSlice";

interface ErrorResponse {
  message: string;
}

interface SingleRoomState {
  roomId: string;
  isLoading: boolean;
  isConfirmDeleteModalOpen: boolean;
  isDeleteSuccess: boolean;
  error?: ErrorResponse;
}

const initialState: SingleRoomState = {
  roomId: null,
  isLoading: false,
  isConfirmDeleteModalOpen: false,
  isDeleteSuccess: false
};

const singleRoomSlice = createSlice({
  name: "singleRoom",
  initialState,
  reducers: {
    setConfirmDeleteModalOpen(state, action: PayloadAction<{ roomId: string; isConfirmDeleteModalOpen: boolean }>) {
      state.roomId = action.payload.roomId;
      state.isConfirmDeleteModalOpen = action.payload.isConfirmDeleteModalOpen;
      state.isDeleteSuccess = false;
      state.error = undefined;
    },
    deleteRoomStart(state) {
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
    }
  }
});

export default singleRoomSlice.reducer;
export const {
  setConfirmDeleteModalOpen,
  deleteRoomStart,
  deleteRoomFailed,
  deleteRoomSuccess
} = singleRoomSlice.actions;

export function deleteRoom(roomId: string): AppThunk {
  return async (dispatch) => {
    try {
      dispatch(deleteRoomStart());
      await Axios.delete(`${hostName}/api/rooms?id=${roomId}`);
      dispatch(deleteRoomSuccess());
      dispatch(resetRoom());
      dispatch(showRoom());
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(deleteRoomFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(deleteRoomFailed({ message: "Something Went Wrong" }));
      } else {
        dispatch(deleteRoomFailed({ message: ex.message }));
      }
    }
  };
}
