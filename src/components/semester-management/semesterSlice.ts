import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { AppThunk } from "~app/store";
import { get, post } from "~utils/axiosUtils";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";

export interface SemesterState {
  id: string;
  name: string;
  lastUpdated: string;
  fileName: string;
}

const semesterSlice = createSlice({
  name: "semesterSlice",
  initialState: [] as SemesterState[],
  reducers: {
    setSemesters(state, action: PayloadAction<SemesterState[]>) {
      return action.payload;
    },
    addSemester(state, action: PayloadAction<SemesterState>) {
      state.push(action.payload);
    },
    updateSemester(state, action: PayloadAction<SemesterState>) {
      const index = _.findIndex(state, { id: action.payload.id });
      state.splice(index, 1, action.payload);
    },
    removeSemester(state, action: PayloadAction<string>) {
      return _.reject(state, { id: action.payload });
    }
  }
});

export default semesterSlice.reducer;

const { setSemesters, addSemester, updateSemester, removeSemester } = semesterSlice.actions;

export function fetchAllSemesters(): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await get("/semester/get")).data;
      dispatch(setSemesters(data));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}

export function addNewSemester(name: string, file: File): AppThunk {
  return async (dispatch) => {
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("file", file);

      const data = (await post("/semester/add", form)).data;
      dispatch(addSemester(data));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}

export function updateExistingSemester(id: string, name: string, file: File): AppThunk {
  return async (dispatch) => {
    try {
      const form = new FormData();
      form.append("id", id);
      form.append("name", name);
      file && form.append("file", file);

      const data = (await post("/semester/update", form)).data;
      dispatch(addSemester(data));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}

export function deleteExistingSemester(id: string): AppThunk {
  return async (dispatch) => {
    try {
      await Axios.delete(`${hostName}/api/semester?id=${id}`);
      dispatch(removeSemester(id));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}
