import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import moment from "moment";
import { AppThunk } from "~app/store";
import { get, post } from "~utils/axiosUtils";

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
    setSchedules(state, action: PayloadAction<Schedule[]>) {
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

export function fetchAllSchedule(): AppThunk {
  return async (dispatch) => {
    try {
      // const data = (await get("/semester/get")).data;
      const data: Schedule[] = [
        { id: "1", date: "2020-12-12", startTime: "12:04", endTime: "15:00", subject: "SWD301", class: "IS1301" },
        { id: "2", date: "2020-12-12", startTime: "12:04", endTime: "15:00", subject: "SWD301", class: "IS1301" },
        { id: "3", date: "2020-12-12", startTime: "12:04", endTime: "15:00", subject: "SWD301", class: "IS1301" },
        { id: "4", date: "2020-12-12", startTime: "12:04", endTime: "15:00", subject: "SWD301", class: "IS1301" },
        { id: "5", date: "2020-12-12", startTime: "12:04", endTime: "15:00", subject: "SWD301", class: "IS1301" }
      ];
      dispatch(setSchedules(data));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}

export function addNewSchedule(schedule: Schedule): AppThunk {
  return async (dispatch) => {
    try {
      // const form = new FormData();
      // form.append("date", schedule.date);
      // form.append("startTime", schedule.startTime);
      // form.append("endTime", schedule.endTime);
      // form.append("subject", schedule.subject);
      // form.append("class", schedule.class);

      // const data = (await post("/semester/schedule/add", form)).data;
      const data = { ...schedule, id: "10", date: moment(schedule.date).format("YYYY-MM-DD") };
      dispatch(addSchedule(data));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}

export function updateExistingSchedules(schedules: Schedule[]): AppThunk {
  return async (dispatch) => {
    try {
      // const data = (await post("/semester/schedule/update", schedules)).data;
      const data = schedules.map((s) => ({ ...s, date: moment(s.date).format("YYYY-MM-DD") }));
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
      // await post("/semester/delete", ids);
      dispatch(removeSchedules(ids));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}
