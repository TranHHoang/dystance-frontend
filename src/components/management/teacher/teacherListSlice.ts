import { createSlice, current, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import _ from "lodash";
import moment from "moment";
import { AppThunk } from "~app/store";
import { ErrorResponse, UserTableInfo } from "~utils/types";

interface TeacherListState {
  teachers: UserTableInfo[];
  isLoading: boolean;
  error?: ErrorResponse;
}

const initialState: TeacherListState = {
  isLoading: true,
  teachers: []
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
      state.error = action.payload;
    },
    addTeacherToList(state, action: PayloadAction<UserTableInfo>) {
      state.teachers.push(action.payload);
    },
    updateTeacherList(state, action: PayloadAction<UserTableInfo[]>) {
      _.forEach(action.payload, (change: UserTableInfo) => {
        const index = _.findIndex(state.teachers, { id: change.id });
        state.teachers.splice(index, 1, change);
      });
    },
    removeTeachersFromList(state, action: PayloadAction<string[]>) {
      _.forEach(current(state.teachers), (teacher: UserTableInfo) => {
        if (action.payload.includes(teacher.id)) {
          _.remove(state.teachers, teacher);
        }
      });
    },
    resetTeacherList() {
      return initialState;
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
  removeTeachersFromList
} = teacherListSlice.actions;

export function showTeacherList(): AppThunk {
  return async (dispatch) => {
    try {
      const data: UserTableInfo[] = [
        {
          id: "1",
          code: "he130268",
          email: "chilp@fe.edu.vn",
          realName: "Le Phuong Chi",
          dob: "2020-12-12"
        },
        {
          id: "2",
          code: "he130268",
          email: "sonnt5@fe.edu.vn",
          realName: "Ngo Tung Son",
          dob: "2020-12-12"
        }
      ];
      dispatch(fetchTeacherListSuccess(data));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(fetchTeacherListFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          fetchTeacherListFailed({
            message: "Something Went Wrong",
            type: 1
          })
        );
      } else {
        dispatch(
          fetchTeacherListFailed({
            message: ex.message,
            type: 2
          })
        );
      }
    }
  };
}

export function addTeacher(teacher: UserTableInfo): AppThunk {
  return async (dispatch) => {
    const teacherFormat: UserTableInfo = {
      id: "1231231541254",
      code: teacher.code,
      email: teacher.email,
      realName: teacher.realName,
      dob: moment(teacher.dob).format("YYYY-MM-DD")
    };
    dispatch(addTeacherToList(teacherFormat));
  };
}

export function updateTeachers(teachers: UserTableInfo[]): AppThunk {
  return async (dispatch) => {
    dispatch(updateTeacherList(teachers));
  };
}

export function deleteTeachers(userIds: string[]): AppThunk {
  return async (dispatch) => {
    dispatch(removeTeachersFromList(userIds));
  };
}
