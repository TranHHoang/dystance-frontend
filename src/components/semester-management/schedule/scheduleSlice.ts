import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { AppThunk } from "~app/store";
import { get, postJson } from "~utils/axiosUtils";

export interface Schedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  subject: string;
  class: string;
}

const scheduleSlice = createSlice({
  name: "scheduleSlice",
  initialState: [] as Schedule[],
  reducers: {
    setSchedules(_, action: PayloadAction<Schedule[]>) {
      return action.payload;
    },
    addSchedule(state, action: PayloadAction<Schedule>) {
      state.push(action.payload);
    },
    updateSchedules(state, action: PayloadAction<Schedule[]>) {
      _.each(action.payload, (schedule) => {
        const index = _.findIndex(state, { id: schedule.id });
        state.splice(index, 1, schedule);
      });
    },
    removeSchedules(state, action: PayloadAction<string[]>) {
      return _.reject(state, ({ id }) => action.payload.includes(id));
    }
  }
});

export default scheduleSlice.reducer;

const { setSchedules, addSchedule, updateSchedules, removeSchedules } = scheduleSlice.actions;

export function fetchAllSchedule(semesterId: string): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await get(`/semesters/schedules/get?semesterId=${semesterId}`)).data;
      // const data: Schedule[] = [
      //   { id: "1", date: "2020-12-12", startTime: "12:04", endTime: "15:00", subject: "SWD301", class: "IS1301" },
      //   { id: "2", date: "2020-12-12", startTime: "12:04", endTime: "15:00", subject: "SWD301", class: "IS1301" },
      //   { id: "3", date: "2020-12-12", startTime: "12:04", endTime: "15:00", subject: "SWD301", class: "IS1301" },
      //   { id: "4", date: "2020-12-12", startTime: "12:04", endTime: "15:00", subject: "SWD301", class: "IS1301" },
      //   { id: "5", date: "2020-12-12", startTime: "12:04", endTime: "15:00", subject: "SWD301", class: "IS1301" }
      // ];
      dispatch(setSchedules(data));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}

export function addNewSchedule(semesterId: string, schedule: Schedule): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await postJson(`/semesters/schedules/add?semesterId=${semesterId}`, schedule)).data;
      // const data = { ...schedule, id: "10", date: moment(schedule.date).format("YYYY-MM-DD") };
      dispatch(addSchedule(data));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}

export function updateExistingSchedules(semesterId: string, schedules: Schedule[]): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await postJson(`/semesters/schedules/update?semesterId=${semesterId}`, schedules)).data;
      // const data = schedules.map((s) => ({ ...s, date: moment(s.date).format("YYYY-MM-DD") }));
      dispatch(updateSchedules(data));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}

export function deleteExistingSchedules(ids: string[]): AppThunk {
  return async (dispatch) => {
    try {
      await postJson("/semesters/schedules/delete", ids);
      dispatch(removeSchedules(ids));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}
