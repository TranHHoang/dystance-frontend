import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Axios from "~utils/fakeAPI";
import { AppThunk } from "~app/store";
import { DeadlineInfo, ErrorResponse } from "~utils/types";
import { hostName } from "~utils/hostUtils";
import { AxiosError } from "axios";
import moment from "moment";
import { CreateDeadlineFormValues } from "../DeadlineListComponent";
import { resetDeadlines, showDeadlines } from "../deadlineListSlice";
import { Logger, LogType } from "~utils/logger";

interface DeadlineCardState {
  isUpdateModalOpen: boolean;
  isDeleteModalOpen: boolean;
  deadline: DeadlineInfo;
  isDeadlineUpdateSuccess: boolean;
  isDeadlineDeleteSuccess: boolean;
  isLoading: boolean;
  error?: ErrorResponse;
}

const initialState: DeadlineCardState = {
  isUpdateModalOpen: false,
  isDeleteModalOpen: false,
  deadline: null,
  isLoading: false,
  isDeadlineUpdateSuccess: false,
  isDeadlineDeleteSuccess: false
};

const deadlineCardSlice = createSlice({
  name: "deadlineCardSlice",
  initialState,
  reducers: {
    setUpdateModalOpen(state, action: PayloadAction<boolean>) {
      state.isUpdateModalOpen = action.payload;
      state.isDeadlineUpdateSuccess = false;
      state.error = undefined;
    },
    setDeleteModalOpen(state, action: PayloadAction<boolean>) {
      state.isDeleteModalOpen = action.payload;
      state.isDeadlineDeleteSuccess = false;
      state.error = undefined;
    },
    deadlineUpdateStart(state) {
      state.isLoading = true;
    },
    deadlineUpdateSuccess(state) {
      state.isLoading = false;
      state.isDeadlineUpdateSuccess = true;
      state.error = undefined;
    },
    deadlineUpdateFailure(state, action: PayloadAction<ErrorResponse>) {
      state.isLoading = false;
      state.isDeadlineUpdateSuccess = false;
      state.error = action.payload;
    },
    deadlineDeleteStart(state) {
      state.isLoading = true;
    },
    deadlineDeleteSuccess(state) {
      state.isLoading = false;
      state.isDeadlineDeleteSuccess = true;
      state.error = undefined;
    },
    deadlineDeleteFailure(state, action: PayloadAction<ErrorResponse>) {
      state.isLoading = false;
      state.isDeadlineDeleteSuccess = false;
      state.error = action.payload;
    },
    setDeadlineInfo(state, action: PayloadAction<DeadlineInfo>) {
      state.deadline = action.payload;
    },
    resetDeadlineCardState() {
      return initialState;
    }
  }
});
export default deadlineCardSlice.reducer;
export const {
  setUpdateModalOpen,
  setDeleteModalOpen,
  setDeadlineInfo,
  deadlineUpdateStart,
  deadlineUpdateSuccess,
  deadlineUpdateFailure,
  deadlineDeleteStart,
  deadlineDeleteSuccess,
  deadlineDeleteFailure,
  resetDeadlineCardState
} = deadlineCardSlice.actions;

const logger = Logger.getInstance();
export function updateDeadline({
  deadlineId,
  title,
  deadlineTime,
  deadlineDate,
  description,
  roomId
}: CreateDeadlineFormValues): AppThunk {
  return async (dispatch) => {
    try {
      dispatch(deadlineUpdateStart());
      const fd = new FormData();
      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };
      fd.append("id", deadlineId);
      fd.append("title", title.trim());
      fd.append("deadlineTime", deadlineTime);
      fd.append("deadlineDate", moment(deadlineDate).format("YYYY-MM-DD"));
      fd.append("description", description);
      fd.append("roomId", roomId);

      await Axios.post(`${hostName}/api/rooms/deadline/update`, fd, config);
      dispatch(deadlineUpdateSuccess());
      dispatch(resetDeadlineCardState());
      dispatch(resetDeadlines());
      dispatch(showDeadlines(roomId));
    } catch (ex) {
      const e = ex as AxiosError;
      if (e.response) {
        dispatch(deadlineUpdateFailure(e.response.data as ErrorResponse));
      } else if (e.request) {
        dispatch(deadlineUpdateFailure({ message: "Something went wrong", type: 2 }));
      } else {
        dispatch(deadlineUpdateFailure({ message: e.message, type: 3 }));
      }
    }
  };
}
export function deleteDeadline(deadlineId: string, title: string, roomId: string): AppThunk {
  return async (dispatch) => {
    try {
      dispatch(deadlineDeleteStart());
      await Axios.delete(`${hostName}/api/rooms/deadline?id=${deadlineId}`);
      dispatch(deadlineDeleteSuccess());
      dispatch(resetDeadlineCardState());
      dispatch(resetDeadlines());
      dispatch(showDeadlines(roomId));
    } catch (ex) {
      const e = ex as AxiosError;
      if (e.response) {
        dispatch(deadlineUpdateFailure(e.response.data as ErrorResponse));
      } else if (e.request) {
        dispatch(deadlineUpdateFailure({ message: "Something went wrong", type: 2 }));
      } else {
        dispatch(deadlineUpdateFailure({ message: e.message, type: 3 }));
      }
    }
  };
}
