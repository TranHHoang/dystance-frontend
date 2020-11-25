import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import _ from "lodash";
import { AppThunk } from "~app/store";
import { get, postForm, postJson } from "~utils/axiosUtils";
import { ErrorResponse } from "~utils/types";
export interface Semester {
  id: string;
  name: string;
  lastUpdated?: string;
  file: File | string;
}
interface SemesterState {
  semesters: Semester[];
  error?: ErrorResponse;
}

const initialState: SemesterState = {
  semesters: []
};

const semesterSlice = createSlice({
  name: "semesterSlice",
  initialState,
  reducers: {
    setSemesters(state, action: PayloadAction<Semester[]>) {
      state.semesters = action.payload;
    },
    addSemester(state, action: PayloadAction<Semester>) {
      state.semesters.push(action.payload);
    },
    updateSemester(state, action: PayloadAction<Semester>) {
      const index = _.findIndex(state.semesters, { id: action.payload.id });
      state.semesters.splice(index, 1, action.payload);
    },
    removeSemesters(state, action: PayloadAction<string[]>) {
      state.semesters = _.reject(state.semesters, ({ id }) => action.payload.includes(id));
    },
    setSemestersFailed(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    },
    addSemesterFailed(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    },
    updateSemesterFailed(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    },
    removeSemestersFailed(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    },
    resetSemesterError(state) {
      state.error = undefined;
    },
    resetSemesterState() {
      return initialState;
    }
  }
});

export default semesterSlice.reducer;

export const {
  setSemesters,
  addSemester,
  updateSemester,
  removeSemesters,
  setSemestersFailed,
  addSemesterFailed,
  removeSemestersFailed,
  updateSemesterFailed,
  resetSemesterError,
  resetSemesterState
} = semesterSlice.actions;

export function fetchAllSemesters(): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await get("/semesters")).data;
      dispatch(setSemesters(data));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(setSemestersFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          setSemestersFailed({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          setSemestersFailed({
            message: ex.message,
            type: 4
          })
        );
      }
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
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(addSemesterFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          addSemesterFailed({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          addSemesterFailed({
            message: ex.message,
            type: 4
          })
        );
      }
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
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(updateSemesterFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          updateSemesterFailed({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          updateSemesterFailed({
            message: ex.message,
            type: 4
          })
        );
      }
    }
  };
}

export function deleteExistingSemesters(ids: string[]): AppThunk {
  return async (dispatch) => {
    try {
      await postJson("/semesters/delete", ids);
      dispatch(removeSemesters(ids));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(removeSemestersFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          removeSemestersFailed({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          removeSemestersFailed({
            message: ex.message,
            type: 4
          })
        );
      }
    }
  };
}