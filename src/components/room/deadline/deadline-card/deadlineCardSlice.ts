import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Axios from "~utils/fakeAPI";
import { AppThunk } from "~app/store";
import { DeadlineInfo, ErrorResponse } from "~utils/types";
import { hostName } from "~utils/hostUtils";
import { AxiosError } from "axios";
import moment from "moment";

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
  deadlineDeleteFailure
} = deadlineCardSlice.actions;
