import { createSlice, current, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import _ from "lodash";
import moment from "moment";
import { AppThunk } from "~app/store";
import { get, postJson } from "~utils/axiosUtils";
import { ErrorResponse, UserTableInfo } from "~utils/types";

interface TeacherListState {
  teachers: UserTableInfo[];
  isLoading: boolean;
  errors?: ErrorResponse[];
}

const initialState: TeacherListState = {
  isLoading: true,
  teachers: [],
  errors: []
};

const teacherListSlice = createSlice({
  name: "teacherListSlice",
  initialState,
  reducers: {
    fetchTeacherListSuccess(state, action: PayloadAction<UserTableInfo[]>) {
      state.isLoading = false;
      state.teachers = action.payload;
    },
    fetchTeacherListFailed(state, action: PayloadAction<ErrorResponse>) {
      state.isLoading = false;
      state.errors = state.errors.concat(action.payload);
    },
    addTeacherToList(state, action: PayloadAction<UserTableInfo>) {
      state.teachers.push(action.payload);
    },
    addTeacherToListFailed(state, action: PayloadAction<ErrorResponse>) {
      state.errors = state.errors.concat(action.payload);
    },
    updateTeacherList(state, action: PayloadAction<UserTableInfo[]>) {
      _.forEach(action.payload, (change: UserTableInfo) => {
        const index = _.findIndex(state.teachers, { id: change.id });
        state.teachers.splice(index, 1, change);
      });
    },
    updateTeacherListFailed(state, action: PayloadAction<ErrorResponse>) {
      state.errors = state.errors.concat(action.payload);
    },
    removeTeachersFromList(state, action: PayloadAction<string[]>) {
      _.forEach(current(state.teachers), (teacher: UserTableInfo) => {
        if (action.payload.includes(teacher.id)) {
          _.remove(state.teachers, teacher);
        }
      });
    },
    removeTeacherListFailed(state, action: PayloadAction<ErrorResponse>) {
      state.errors = state.errors.concat(action.payload);
    },
    resetTeacherList() {
      return initialState;
    },
    resetTeacherError(state) {
      state.errors = [];
    }
  }
});

export default teacherListSlice.reducer;
export const {
  fetchTeacherListFailed,
  fetchTeacherListSuccess,
  resetTeacherList,
  addTeacherToList,
  updateTeacherList,
  removeTeachersFromList,
  addTeacherToListFailed,
  updateTeacherListFailed,
  removeTeacherListFailed,
  resetTeacherError
} = teacherListSlice.actions;

export function showTeacherList(): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await get(`/users/teachers`)).data as UserTableInfo[];
      dispatch(fetchTeacherListSuccess(data));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(fetchTeacherListFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          fetchTeacherListFailed({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          fetchTeacherListFailed({
            message: ex.message,
            type: 4
          })
        );
      }
    }
  };
}

export function addTeacher(teacher: UserTableInfo): AppThunk {
  return async (dispatch) => {
    try {
      const teacherFormat: UserTableInfo = {
        ...teacher,
        dob: moment(teacher.dob).format("YYYY-MM-DD")
      };
      const data = (await postJson(`/users/teachers/add`, teacherFormat)).data;
      dispatch(addTeacherToList(data));
    } catch (e) {
      const ex = e as AxiosError;
      if (ex.response?.data) {
        dispatch(addTeacherToListFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          addTeacherToListFailed({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          addTeacherToListFailed({
            message: ex.message,
            type: 4
          })
        );
      }
    }
  };
}

export function updateTeachers(teachers: UserTableInfo[]): AppThunk {
  return async (dispatch) => {
    try {
      const teacherFormat = teachers.map((teacher) => ({ ...teacher, dob: moment(teacher.dob).format("YYYY-MM-DD") }));

      const data = (await postJson(`/users/teachers/update`, teacherFormat)).data;
      dispatch(updateTeacherList(data));
      if (data.success.length > 0) {
        dispatch(updateTeacherList(data.success));
      }
      if (data.failed.length > 0) {
        _.forEach(data.failed, (error: ErrorResponse) => {
          dispatch(updateTeacherListFailed(error));
        });
        dispatch(showTeacherList());
      }
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(updateTeacherListFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          updateTeacherListFailed({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          updateTeacherListFailed({
            message: ex.message,
            type: 4
          })
        );
      }
    }
  };
}

export function deleteTeachers(userIds: string[]): AppThunk {
  return async (dispatch) => {
    try {
      await postJson("/users/teachers/delete", userIds);
      dispatch(removeTeachersFromList(userIds));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(removeTeacherListFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          removeTeacherListFailed({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          removeTeacherListFailed({
            message: ex.message,
            type: 4
          })
        );
      }
    }
  };
}