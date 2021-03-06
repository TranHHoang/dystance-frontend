import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import _ from "lodash";
import fs from "fs";
import moment from "moment";
import { AppThunk } from "~app/store";
import { get, post, ErrorResponse } from "~utils/index";

export interface Class {
  id: string;
  subject: string;
  class: string;
  teacher: string;
  students: string[];
}
interface ClassState {
  classes: Class[];
  errors?: ErrorResponse[];
}

const initialState: ClassState = {
  classes: [],
  errors: []
};

const classSlice = createSlice({
  name: "classSlice",
  initialState,
  reducers: {
    setClasses(state, action: PayloadAction<Class[]>) {
      state.classes = action.payload;
    },
    setClassesFailed(state, action: PayloadAction<ErrorResponse>) {
      state.errors = state.errors.concat(action.payload);
    },
    addClass(state, action: PayloadAction<Class>) {
      state.classes.push(action.payload);
    },
    addClassFailed(state, action: PayloadAction<ErrorResponse>) {
      state.errors = state.errors.concat(action.payload);
    },
    updateClasses(state, action: PayloadAction<Class[]>) {
      _.each(action.payload, (schedule) => {
        const index = _.findIndex(state.classes, { id: schedule.id });
        state.classes.splice(index, 1, schedule);
      });
    },
    updateClassesFailed(state, action: PayloadAction<ErrorResponse>) {
      state.errors = state.errors.concat(action.payload);
    },
    removeClasses(state, action: PayloadAction<string[]>) {
      state.classes = _.reject(state.classes, ({ id }) => action.payload.includes(id));
    },
    removeClassesFailed(state, action: PayloadAction<ErrorResponse>) {
      state.errors = state.errors.concat(action.payload);
    },
    resetClassError(state) {
      state.errors = [];
    },
    resetClassState() {
      return initialState;
    }
  }
});

export default classSlice.reducer;

export const {
  addClass,
  removeClasses,
  setClasses,
  updateClasses,
  addClassFailed,
  removeClassesFailed,
  setClassesFailed,
  updateClassesFailed,
  resetClassError,
  resetClassState
} = classSlice.actions;

export function fetchAllClasses(semesterId: string): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await get(`/semesters/classes?semesterId=${semesterId}`)).data;
      dispatch(setClasses(data));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(setClassesFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          setClassesFailed({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          setClassesFailed({
            message: ex.message,
            type: 4
          })
        );
      }
    }
  };
}

export function addNewClass(semesterId: string, classObj: Class): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await post(`/semesters/classes/add?semesterId=${semesterId}`, classObj)).data;
      dispatch(addClass(data));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(addClassFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          addClassFailed({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          addClassFailed({
            message: ex.message,
            type: 4
          })
        );
      }
    }
  };
}

export function updateExistingClasses(semesterId: string, classes: Class[]): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await post(`/semesters/classes/update?semesterId=${semesterId}`, classes)).data;
      if (data.success.length > 0) {
        dispatch(updateClasses(data.success));
      }
      if (data.failed.length > 0) {
        dispatch(updateClassesFailed(data.failed));
        const errors: ErrorResponse[] = _.map(data.failed, "message");
        if (errors.length > 5) {
          const folderName = `./errors/classes`;
          if (!fs.existsSync(folderName)) {
            fs.mkdirSync(folderName, { recursive: true });
          }
          fs.writeFile(`./errors/classes/${moment().format("YYYY-MM-DD")}.txt`, errors.join("\n"), (err) => {
            if (err) {
              console.log(err);
            }
          });
        }
        dispatch(fetchAllClasses(semesterId));
      }
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(updateClassesFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          updateClassesFailed({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          updateClassesFailed({
            message: ex.message,
            type: 4
          })
        );
      }
    }
  };
}

export function deleteExistingClasses(semesterId: string, ids: string[]): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await post(`/semesters/classes/delete`, ids)).data;
      if (data.success.length > 0) {
        dispatch(removeClasses(data.success));
      }
      if (data.failed.length > 0) {
        dispatch(
          removeClassesFailed({
            message: "Class cannot be deleted",
            type: 1
          })
        );
        dispatch(fetchAllClasses(semesterId));
      }
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(removeClassesFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          removeClassesFailed({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          removeClassesFailed({
            message: ex.message,
            type: 4
          })
        );
      }
    }
  };
}
