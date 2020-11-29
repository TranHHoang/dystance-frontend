import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import _ from "lodash";
import moment from "moment";
import { AppThunk } from "~app/store";
import { get, postJson } from "~utils/axiosUtils";
import { ErrorResponse } from "~utils/types";

export interface Schedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  subject: string;
  class: string;
}

interface ScheduleState {
  schedules: Schedule[];
  error?: ErrorResponse;
}
const initialState: ScheduleState = {
  schedules: []
};

const scheduleSlice = createSlice({
  name: "scheduleSlice",
  initialState,
  reducers: {
    setSchedules(state, action: PayloadAction<Schedule[]>) {
      state.schedules = action.payload;
    },
    setSchedulesFailed(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    },
    addSchedule(state, action: PayloadAction<Schedule>) {
      state.schedules.push(action.payload);
    },
    addScheduleFailed(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    },
    updateSchedules(state, action: PayloadAction<Schedule[]>) {
      _.each(action.payload, (schedule) => {
        const index = _.findIndex(state.schedules, { id: schedule.id });
        state.schedules.splice(index, 1, schedule);
      });
    },
    updateSchedulesFailed(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    },
    removeSchedules(state, action: PayloadAction<string[]>) {
      state.schedules = _.reject(state.schedules, ({ id }) => action.payload.includes(id));
    },
    removeSchedulesFailed(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    },
    resetErrorState(state) {
      state.error = undefined;
    },
    resetScheduleState() {
      return initialState;
    }
  }
});

export default scheduleSlice.reducer;

export const {
  setSchedules,
  addSchedule,
  updateSchedules,
  removeSchedules,
  setSchedulesFailed,
  addScheduleFailed,
  updateSchedulesFailed,
  removeSchedulesFailed,
  resetErrorState,
  resetScheduleState
} = scheduleSlice.actions;

export function fetchAllSchedule(semesterId: string): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await get(`/semesters/schedules?semesterId=${semesterId}`)).data;
      dispatch(setSchedules(data));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(setSchedulesFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          setSchedulesFailed({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          setSchedulesFailed({
            message: ex.message,
            type: 4
          })
        );
      }
    }
  };
}

export function addNewSchedule(semesterId: string, schedule: Schedule): AppThunk {
  return async (dispatch) => {
    try {
      const scheduleFormat = {
        ...schedule,
        date: moment(schedule.date).format("YYYY-MM-DD")
      };
      console.log(scheduleFormat);
      const data = (await postJson(`/semesters/schedules/add?semesterId=${semesterId}`, scheduleFormat)).data;
      dispatch(addSchedule(data));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(addScheduleFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          addScheduleFailed({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          addScheduleFailed({
            message: ex.message,
            type: 4
          })
        );
      }
    }
  };
}

export function updateExistingSchedules(semesterId: string, schedules: Schedule[]): AppThunk {
  return async (dispatch) => {
    try {
      const scheduleFormat = schedules.map((s) => ({ ...s, date: moment(s.date).format("YYYY-MM-DD") }));
      console.log(scheduleFormat);
      const data = (await postJson(`/semesters/schedules/update?semesterId=${semesterId}`, scheduleFormat)).data;
      if (data.success.length > 0) {
        dispatch(updateSchedules(data.success));
      }
      if (data.failed.length > 0) {
        dispatch(
          updateSchedulesFailed({
            message: "There was a problem with updating a few of the schedules, please try again",
            type: 1
          })
        );
        dispatch(fetchAllSchedule(semesterId));
      }
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(updateSchedulesFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          updateSchedulesFailed({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          updateSchedulesFailed({
            message: ex.message,
            type: 4
          })
        );
      }
    }
  };
}

export function deleteExistingSchedules(ids: string[]): AppThunk {
  return async (dispatch) => {
    try {
      await postJson("/semesters/schedules/delete", ids);
      dispatch(removeSchedules(ids));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(removeSchedulesFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          removeSchedulesFailed({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          removeSchedulesFailed({
            message: ex.message,
            type: 4
          })
        );
      }
    }
  };
}
