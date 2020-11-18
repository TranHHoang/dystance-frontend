import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { AppThunk } from "~app/store";
import { get, post } from "~utils/axiosUtils";

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
    updateSemesters(state, action: PayloadAction<Semester[]>) {
      _.each(action.payload, (semester) => {
        const index = _.findIndex(state, { id: semester.id });
        state.splice(index, 1, semester);
      });
    },
    removeSemesters(state, action: PayloadAction<string[]>) {
      return _.reject(state, ({ id }) => action.payload.includes(id));
    }
  }
});

export default semesterSlice.reducer;

const { setSemesters, addSemester, updateSemesters, removeSemesters } = semesterSlice.actions;

export function fetchAllSemesters(): AppThunk {
  return async (dispatch) => {
    try {
      // const data = (await get("/semester/get")).data;
      const data = [
        { id: "1", name: "Test", lastUpdated: "02/02/2020 at 13:20", file: "1234" },
        { id: "2", name: "Test2", lastUpdated: "02/02/2020 at 13:20", file: "1234" },
        { id: "3", name: "Test3", lastUpdated: "02/02/2020 at 13:20", file: "1234" },
        { id: "4", name: "Test4", lastUpdated: "02/02/2020 at 13:20", file: "1234" },
        { id: "5", name: "Test5", lastUpdated: "02/02/2020 at 13:20", file: "1234" },
        { id: "6", name: "Test6", lastUpdated: "02/02/2020 at 13:20", file: "1234" }
      ];
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
      // const form = new FormData();
      // form.append("name", name);
      // form.append("file", file);

      // const data = (await post("/semester/add", form)).data;
      const data: Semester = { id: "123", name, file: "Test.xls", lastUpdated: "2020-02-02 " };
      dispatch(addSemester(data));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}

export function updateExistingSemesters(semesters: Semester[]): AppThunk {
  return async (dispatch) => {
    try {
      // const data = (await post("/semester/update", semesters)).data;
      const data = semesters;
      dispatch(updateSemesters(data));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}

export function deleteExistingSemesters(ids: string[]): AppThunk {
  return async (dispatch) => {
    try {
      // await post("/semester/delete", ids);
      dispatch(removeSemesters(ids));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}
