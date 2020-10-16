import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "~app/store";
import { getLoginData } from "~utils/tokenStorage";
import { ErrorResponse, TimetableEvent } from "~utils/types";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";
import { AxiosError } from "axios";
import moment from "moment";

interface TimetableState {
  events: TimetableEvent[];
  error?: ErrorResponse;
}

const initialState: TimetableState = {
  events: []
};

const timetableSlice = createSlice({
  name: "timetableSlice",
  initialState,
  reducers: {
    fetchTimetableSuccess(state, action: PayloadAction<TimetableEvent[]>) {
      state.events = state.events.concat(action.payload);
    },
    fetchTimetableFailed(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    },
    resetTimetable() {
      return initialState;
    }
  }
});

export default timetableSlice.reducer;
export const { fetchTimetableSuccess, fetchTimetableFailed } = timetableSlice.actions;

export function showTimetableEvents(week: Date, endOfWeek: Date): AppThunk {
  return async (dispatch) => {
    try {
      const startDate = moment(week).format("YYYY-MM-DD");
      const endDate = moment(endOfWeek).format("YYYY-MM-DD");
      const id = getLoginData().id;
      const response = await Axios.get(`${hostName}/api/timetable?id=${id}&startDate=${endDate}&endDate=${endDate}`);
      const data = response.data as TimetableEvent[];
      dispatch(fetchTimetableSuccess(data));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(fetchTimetableFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          fetchTimetableFailed({
            message: "Something Went Wrong",
            type: 1
          })
        );
      } else {
        dispatch(
          fetchTimetableFailed({
            message: ex.message,
            type: 2
          })
        );
      }
    }
  };
}
