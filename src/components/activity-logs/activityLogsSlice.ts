import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import _ from "lodash";
import { AppThunk } from "~app/store";
import { get } from "~utils/axiosUtils";
import { ActivityLog, ErrorResponse } from "~utils/index";

interface ActivityLogState {
  logs: ActivityLog[];
  isLoading: boolean;
  error?: ErrorResponse;
}

const initialState: ActivityLogState = {
  logs: [],
  isLoading: true
};

const activityLogSlice = createSlice({
  name: "activityLogSlice",
  initialState,
  reducers: {
    fetchLogsSuccess(state, action: PayloadAction<ActivityLog[]>) {
      state.isLoading = false;
      state.logs = action.payload;
    },
    fetchLogsFailed(state, action: PayloadAction<ErrorResponse>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    resetActivityLogState() {
      return initialState;
    },
    resetLogError(state) {
      state.error = undefined;
    }
  }
});

export default activityLogSlice.reducer;
export const { fetchLogsSuccess, fetchLogsFailed, resetActivityLogState, resetLogError } = activityLogSlice.actions;

export function getActivityLogs(roomId: string): AppThunk {
  return async (dispatch) => {
    try {
      console.log("RoomId:", roomId);
      const response = await get(`/users/logs/getByRoom?roomId=${roomId}`);
      const data = response.data as ActivityLog[];
      dispatch(fetchLogsSuccess(data));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(fetchLogsFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          fetchLogsFailed({
            message: "Something Went Wrong",
            type: 1
          })
        );
      } else {
        dispatch(
          fetchLogsFailed({
            message: ex.message,
            type: 2
          })
        );
      }
    }
  };
}
