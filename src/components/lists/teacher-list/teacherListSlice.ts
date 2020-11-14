import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { AppThunk } from "~app/store";
import { ErrorResponse, UserTableInfo } from "~utils/types";

interface TeacherListState {
  teachers: UserTableInfo[];
  error?: ErrorResponse;
}

const initialState: TeacherListState = {
  teachers: []
};

const teacherListSlice = createSlice({
  name: "teacherListSlice",
  initialState,
  reducers: {
    fetchTeacherListSuccess(state, action: PayloadAction<UserTableInfo[]>) {
      state.teachers = action.payload;
    },
    fetchTeacherListFailed(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    },
    resetTeacherList() {
      return initialState;
    }
  }
});

export default teacherListSlice.reducer;
export const { fetchTeacherListFailed, fetchTeacherListSuccess, resetTeacherList } = teacherListSlice.actions;

export function showTeacherList(): AppThunk {
  return async (dispatch) => {
    try {
      const data: UserTableInfo[] = [
        {
          id: "1",
          email: "chilp@fe.edu.vn",
          realName: "Le Phuong Chi",
          dob: "2020-12-12"
        },
        {
          id: "2",
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
