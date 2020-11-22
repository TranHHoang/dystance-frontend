import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { AppThunk } from "~app/store";
import { get, postForm, postJson } from "~utils/axiosUtils";

export interface Semester {
  id: string;
  name: string;
  lastUpdated?: string;
  file: File | string;
}

const semesterSlice = createSlice({
  name: "semesterSlice",
  initialState: [] as Semester[],
  reducers: {
    setSemesters(_, action: PayloadAction<Semester[]>) {
      return action.payload;
    },
    addSemester(state, action: PayloadAction<Semester>) {
      state.push(action.payload);
    },
    updateSemester(state, action: PayloadAction<Semester>) {
      const index = _.findIndex(state, { id: action.payload.id });
      state.splice(index, 1, action.payload);
    },
    removeSemesters(state, action: PayloadAction<string[]>) {
      return _.reject(state, ({ id }) => action.payload.includes(id));
    }
  }
});

export default semesterSlice.reducer;

const { setSemesters, addSemester, updateSemester, removeSemesters } = semesterSlice.actions;

export function fetchAllSemesters(): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await get("/semesters")).data;
      dispatch(setSemesters(data));
    } catch (ex) {
      //TODO: Replace with notification
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

      const data = (await postForm("/semesters/add", form)).data;
      dispatch(addSemester(data));
    } catch (ex) {
      //TODO: Replace with notification
      console.log(ex);
    }
  };
}

export function updateExistingSemester(semester: Semester): AppThunk {
  return async (dispatch) => {
    try {
      console.log(semester.file);
      const fd = new FormData();

      fd.append("id", semester.id);
      fd.append("name", semester.name);
      fd.append("file", semester.file);
      const data = (await postForm("/semesters/update", fd)).data;
      console.log(data);
      dispatch(updateSemester(data));
    } catch (ex) {
      //TODO: Replace with notification
      console.log(ex);
    }
  };
}

export function deleteExistingSemesters(ids: string[]): AppThunk {
  return async (dispatch) => {
    try {
      await postJson("/semesters/delete", ids);
      dispatch(removeSemesters(ids));
    } catch (ex) {
      //TODO: Replace with notification
      console.log(ex);
    }
  };
}
