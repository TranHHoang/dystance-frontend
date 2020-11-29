import { createSlice, current, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import _ from "lodash";
import moment from "moment";
import { AppThunk } from "~app/store";
import { ErrorResponse, post, get } from "~utils/index";
import { UserTableInfo } from "../StudentTeacherTable";

interface StudentListState {
  students: UserTableInfo[];
  isLoading: boolean;
  errors?: ErrorResponse[];
}

const initialState: StudentListState = {
  isLoading: true,
  students: [],
  errors: []
};

const studentListSlice = createSlice({
  name: "studentListSlice",
  initialState,
  reducers: {
    fetchStudentListSuccess(state, action: PayloadAction<UserTableInfo[]>) {
      state.students = action.payload;
      state.isLoading = false;
    },
    fetchStudentListFailed(state, action: PayloadAction<ErrorResponse>) {
      state.isLoading = false;
      state.errors = state.errors.concat(action.payload);
    },
    addStudentToList(state, action: PayloadAction<UserTableInfo>) {
      state.students.push(action.payload);
    },
    addStudentToListFailed(state, action: PayloadAction<ErrorResponse>) {
      state.errors = state.errors.concat(action.payload);
    },
    updateStudentList(state, action: PayloadAction<UserTableInfo[]>) {
      _.forEach(action.payload, (change: UserTableInfo) => {
        const index = _.findIndex(state.students, { id: change.id });
        state.students.splice(index, 1, change);
      });
    },
    updateStudentListFailed(state, action: PayloadAction<ErrorResponse>) {
      state.errors = state.errors.concat(action.payload);
    },
    removeStudentsFromList(state, action: PayloadAction<string[]>) {
      _.forEach(current(state.students), (student: UserTableInfo) => {
        if (action.payload.includes(student.id)) {
          _.remove(state.students, student);
        }
      });
    },
    removeStudentsFromListFailed(state, action: PayloadAction<ErrorResponse>) {
      state.errors = state.errors.concat(action.payload);
    },

    resetStudentList() {
      return initialState;
    },
    resetStudentError(state) {
      state.errors = [];
    }
  }
});

export default studentListSlice.reducer;
export const {
  fetchStudentListFailed,
  fetchStudentListSuccess,
  resetStudentList,
  removeStudentsFromList,
  addStudentToList,
  updateStudentList,
  addStudentToListFailed,
  updateStudentListFailed,
  removeStudentsFromListFailed,
  resetStudentError
} = studentListSlice.actions;

export function showStudentList(): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await get(`/users/students`)).data as UserTableInfo[];
      dispatch(fetchStudentListSuccess(data));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(fetchStudentListFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          fetchStudentListFailed({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          fetchStudentListFailed({
            message: ex.message,
            type: 4
          })
        );
      }
    }
  };
}

export function addStudent(student: UserTableInfo): AppThunk {
  return async (dispatch) => {
    try {
      const studentFormat: UserTableInfo = {
        ...student,
        dob: moment(student.dob).format("YYYY-MM-DD")
      };
      const data = (await post(`/users/students/add`, studentFormat)).data;
      dispatch(addStudentToList(data));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(addStudentToListFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          addStudentToListFailed({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          addStudentToListFailed({
            message: ex.message,
            type: 4
          })
        );
      }
    }
  };
}
export function deleteStudents(userIds: string[]): AppThunk {
  return async (dispatch) => {
    try {
      await post("/users/students/delete", userIds);
      dispatch(removeStudentsFromList(userIds));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(removeStudentsFromListFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          removeStudentsFromListFailed({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          removeStudentsFromListFailed({
            message: ex.message,
            type: 4
          })
        );
      }
    }
  };
}

export function updateStudents(students: UserTableInfo[]): AppThunk {
  return async (dispatch) => {
    try {
      const studentFormat = students.map((s) => ({ ...s, dob: moment(s.dob).format("YYYY-MM-DD") }));

      const data = (await post(`/users/students/update`, studentFormat)).data;
      if (data.success.length > 0) {
        dispatch(updateStudentList(data.success));
      }
      if (data.failed.length > 0) {
        _.forEach(data.failed, (error: ErrorResponse) => {
          console.log(error);
          dispatch(updateStudentListFailed(error));
        });
        dispatch(showStudentList());
      }
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(updateStudentListFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          updateStudentListFailed({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          updateStudentListFailed({
            message: ex.message,
            type: 4
          })
        );
      }
    }
  };
}
