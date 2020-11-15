import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { AppThunk } from "~app/store";
import { get, post } from "~utils/axiosUtils";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";

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
    setSchedule(state, action: PayloadAction<Schedule[]>) {
      return action.payload;
    },
    addSchedule(state, action: PayloadAction<Schedule>) {
      state.push(action.payload);
    },
    updateSchedule(state, action: PayloadAction<Schedule>) {
      const index = _.findIndex(state, { id: action.payload.id });
      state.splice(index, 1, action.payload);
    },
    removeSchedule(state, action: PayloadAction<string>) {
      return _.reject(state, { id: action.payload });
    }
  }
});

export default scheduleSlice.reducer;

const { setSchedule, addSchedule, updateSchedule, removeSchedule } = scheduleSlice.actions;

export function fetchAllSchedule(): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await get("/semester/get")).data;
      dispatch(setSchedule(data));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}

export function addNewSchedule(schedule: Schedule): AppThunk {
  return async (dispatch) => {
    try {
      const form = new FormData();
      form.append("date", schedule.date);
      form.append("startTime", schedule.startTime);
      form.append("endTime", schedule.endTime);
      form.append("subject", schedule.subject);
      form.append("class", schedule.class);

      const data = (await post("/semester/schedule/add", form)).data;
      dispatch(addNewSchedule(data));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}

export function updateExistingSchedule(schedule: Schedule): AppThunk {
  return async (dispatch) => {
    try {
      const form = new FormData();
      form.append("date", schedule.date);
      form.append("startTime", schedule.startTime);
      form.append("endTime", schedule.endTime);
      form.append("subject", schedule.subject);
      form.append("class", schedule.class);

      const data = (await post("/semester/schedule/update", form)).data;
      dispatch(updateSchedule(data));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}

export function deleteExistingSchedule(id: string): AppThunk {
  return async (dispatch) => {
    try {
      await Axios.delete(`${hostName}/api/semester/schedule?id=${id}`);
      dispatch(removeSchedule(id));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}
