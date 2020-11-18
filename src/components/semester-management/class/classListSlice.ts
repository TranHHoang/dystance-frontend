import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { AppThunk } from "~app/store";
import { get, postJson } from "~utils/axiosUtils";

export interface Class {
  id: string;
  subject: string;
  class: string;
  teacher: string;
  students: string[];
}

const classSlice = createSlice({
  name: "classSlice",
  initialState: [] as Class[],
  reducers: {
    setClasses(_, action: PayloadAction<Class[]>) {
      return action.payload;
    },
    addClass(state, action: PayloadAction<Class>) {
      state.push(action.payload);
    },
    updateClasses(state, action: PayloadAction<Class[]>) {
      _.each(action.payload, (schedule) => {
        const index = _.findIndex(state, { id: schedule.id });
        state.splice(index, 1, schedule);
      });
    },
    removeClasses(state, action: PayloadAction<string[]>) {
      return _.reject(state, ({ id }) => action.payload.includes(id));
    }
  }
});

export default classSlice.reducer;

const { addClass, removeClasses, setClasses, updateClasses } = classSlice.actions;

export function fetchAllClasses(semesterId: string): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await get(`/semesters/classes/get?semesterId=${semesterId}`)).data;
      // const data: Class[] = [
      //   { id: "1", teacher: "1", subject: "SWD301", class: "IS1301", students: ["2"] },
      //   { id: "2", teacher: "1", subject: "SWD301", class: "IS1301", students: ["2"] },
      //   { id: "3", teacher: "1", subject: "SWD301", class: "IS1301", students: ["2"] },
      //   { id: "4", teacher: "1", subject: "SWD301", class: "IS1301", students: ["2"] },
      //   { id: "5", teacher: "1", subject: "SWD301", class: "IS1301", students: ["2"] }
      // ];
      dispatch(setClasses(data));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}

export function addNewClass(semesterId: string, classObj: Class): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await postJson(`/semesters/classes/add?semesterId=${semesterId}`, classObj)).data;
      dispatch(addClass(data));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}

export function updateExistingClasses(semesterId: string, classes: Class[]): AppThunk {
  console.log(classes);
  return async (dispatch) => {
    try {
      const data = (await postJson(`/semesters/classes/update?semesterId=${semesterId}`, classes)).data;
      dispatch(updateClasses(data));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}

export function deleteExistingClasses(ids: string[]): AppThunk {
  return async (dispatch) => {
    try {
      await postJson(`/semesters/classes/delete`, ids);
      dispatch(removeClasses(ids));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}
