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
    addTeacherToListFailed(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    },
    updateTeacherList(state, action: PayloadAction<UserTableInfo[]>) {
      _.forEach(action.payload, (change: UserTableInfo) => {
        const index = _.findIndex(state.teachers, { id: change.id });
        state.teachers.splice(index, 1, change);
      });
    },
    updateTeacherListFailed(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    },
    removeTeachersFromList(state, action: PayloadAction<string[]>) {
      _.forEach(current(state.teachers), (teacher: UserTableInfo) => {
        if (action.payload.includes(teacher.id)) {
          _.remove(state.teachers, teacher);
        }
      });
    },
    removeTeacherListFailed(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
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
  removeTeachersFromList,
  addTeacherToListFailed,
  updateTeacherListFailed,
  removeTeacherListFailed
} = teacherListSlice.actions;

export function showTeacherList(semesterId: string): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await get(`/semesters/teachers/get?id=${semesterId}`)).data as UserTableInfo[];

      // const data: UserTableInfo[] = [
      //   {
      //     id: "1",
      //     code: "he130268",
      //     email: "chilp@fe.edu.vn",
      //     realName: "Le Phuong Chi",
      //     dob: "2020-12-12"
      //   },
      //   {
      //     id: "2",
      //     code: "he130268",
      //     email: "sonnt5@fe.edu.vn",
      //     realName: "Ngo Tung Son",
      //     dob: "2020-12-12"
      //   }
      // ];
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

export function addTeacher(semesterId: string, teacher: UserTableInfo): AppThunk {
  return async (dispatch) => {
    try {
      const teacherFormat: UserTableInfo = {
        ...teacher,
        dob: moment(teacher.dob).format("YYYY-MM-DD")
      };
      const data = (await postJson(`/semesters/teachers/add?semesterId=${semesterId}`, teacherFormat)).data;
      dispatch(addTeacherToList(data));
    } catch (e) {
      const ex = e as AxiosError;
      if (ex.response?.data) {
        dispatch(addTeacherToListFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          addTeacherToListFailed({
            message: "Something Went Wrong",
            type: 1
          })
        );
      } else {
        dispatch(
          addTeacherToListFailed({
            message: ex.message,
            type: 2
          })
        );
      }
    }
  };
}

export function updateTeachers(semesterId: string, teachers: UserTableInfo[]): AppThunk {
  return async (dispatch) => {
    try {
      const teacherFormat = teachers.map((teacher) => ({ ...teacher, dob: moment(teacher.dob).format("YYYY-MM-DD") }));

      const data = (await postJson(`/semesters/teachers/update?semesterId=${semesterId}`, teacherFormat)).data;
      dispatch(updateTeacherList(data));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(updateTeacherListFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          updateTeacherListFailed({
            message: "Something Went Wrong",
            type: 1
          })
        );
      } else {
        dispatch(
          updateTeacherListFailed({
            message: ex.message,
            type: 2
          })
        );
      }
    }
  };
}

export function deleteTeachers(userIds: string[]): AppThunk {
  return async (dispatch) => {
    try {
      await postJson("/semesters/teachers/delete", userIds);
      dispatch(removeTeachersFromList(userIds));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(removeTeacherListFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          removeTeacherListFailed({
            message: "Something Went Wrong",
            type: 1
          })
        );
      } else {
        dispatch(
          removeTeacherListFailed({
            message: ex.message,
            type: 2
          })
        );
      }
    }
  };
}
