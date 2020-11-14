import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { AppThunk } from "~app/store";
import { ErrorResponse, UserTableInfo } from "~utils/types";

interface StudentListState {
  students: UserTableInfo[];
  error?: ErrorResponse;
}

const initialState: StudentListState = {
  students: []
};

const studentListSlice = createSlice({
  name: "studentListSlice",
  initialState,
  reducers: {
    fetchStudentListSuccess(state, action: PayloadAction<UserTableInfo[]>) {
      state.students = action.payload;
    },
    fetchStudentListFailed(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    },
    resetStudentList() {
      return initialState;
    }
  }
});

export default studentListSlice.reducer;
export const { fetchStudentListFailed, fetchStudentListSuccess, resetStudentList } = studentListSlice.actions;

export function showStudentList(): AppThunk {
  return async (dispatch) => {
    try {
      const data: UserTableInfo[] = [
        {
          id: "1",
          email: "minhhqhe130268@fpt.edu.vn",
          realName: "Ho Quang Minh",
          dob: "2020-12-12"
        },
        {
          id: "2",
          email: "blaqhe130268@fpt.edu.vn",
          realName: "Ho Minh",
          dob: "2020-12-12"
        },
        {
          id: "3",
          email: "sawdhqhe130268@fpt.edu.vn",
          realName: "Ho Quang ",
          dob: "2020-12-12"
        },
        {
          id: "4",
          email: "minhhawdawadqhe130268@fpt.edu.vn",
          realName: "Ho Quang Minh",
          dob: "2020-12-12"
        },
        {
          id: "5",
          email: "minhhqhe130268@fpt.edu.vn",
          realName: "Ho Quang sqsqs",
          dob: "2020-12-12"
        },
        {
          id: "6",
          email: "minhhqhe130268@fpt.edu.vn",
          realName: "Ho Quang sqsqs",
          dob: "2020-12-12"
        },
        {
          id: "7",
          email: "minhhqhe130268@fpt.edu.vn",
          realName: "Ho Quang sqsqs",
          dob: "2020-12-12"
        },
        {
          id: "8",
          email: "minhhqhe130268@fpt.edu.vn",
          realName: "Ho Quang sqsqs",
          dob: "2020-12-12"
        },
        {
          id: "9",
          email: "minhhqhe130268@fpt.edu.vn",
          realName: "Ho Quang sqsqs",
          dob: "2020-12-12"
        },
        {
          id: "10",
          email: "minhhqhe130268@fpt.edu.vn",
          realName: "Ho Quang sqsqs",
          dob: "2020-12-12"
        }
      ];
      dispatch(fetchStudentListSuccess(data));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(fetchStudentListFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          fetchStudentListFailed({
            message: "Something Went Wrong",
            type: 1
          })
        );
      } else {
        dispatch(
          fetchStudentListFailed({
            message: ex.message,
            type: 2
          })
        );
      }
    }
  };
}
