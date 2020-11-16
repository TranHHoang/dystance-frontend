import { createSlice, current, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import _ from "lodash";
import moment from "moment";
import { AppThunk } from "~app/store";
import { ErrorResponse, UserTableInfo } from "~utils/types";

interface StudentListState {
  students: UserTableInfo[];
  isLoading: boolean;
  error?: ErrorResponse;
}

const initialState: StudentListState = {
  isLoading: true,
  students: []
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
      state.error = action.payload;
    },
    addStudentToList(state, action: PayloadAction<UserTableInfo>) {
      state.students.push(action.payload);
    },
    updateStudentList(state, action: PayloadAction<UserTableInfo[]>) {
      _.forEach(action.payload, (change: UserTableInfo) => {
        const index = _.findIndex(state.students, { id: change.id });
        state.students.splice(index, 1, change);
      });
    },
    removeStudentsFromList(state, action: PayloadAction<string[]>) {
      _.forEach(current(state.students), (student: UserTableInfo) => {
        if (action.payload.includes(student.id)) {
          _.remove(state.students, student);
        }
      });
    },

    resetStudentList() {
      return initialState;
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
  updateStudentList
} = studentListSlice.actions;

export function showStudentList(): AppThunk {
  return async (dispatch) => {
    try {
      const data: UserTableInfo[] = [
        {
          id: "1",
          code: "he130268",
          email: "minhhqhe130268@fpt.edu.vn",
          realName: "Ho Quang Minh",
          dob: "2020-12-12"
        },
        {
          id: "2",
          code: "he130268",
          email: "blaqhe130268@fpt.edu.vn",
          realName: "Ho Minh",
          dob: "2020-12-12"
        },
        {
          id: "3",
          code: "he130268",
          email: "sawdhqhe130268@fpt.edu.vn",
          realName: "Ho Quang ",
          dob: "2020-12-12"
        },
        {
          id: "4",
          code: "he130268",
          email: "minhhawdawadqhe130268@fpt.edu.vn",
          realName: "Ho Quang Minh",
          dob: "2020-12-12"
        },
        {
          id: "5",
          code: "he130268",
          email: "minhhqhe130268@fpt.edu.vn",
          realName: "Ho Quang sqsqs",
          dob: "2020-12-12"
        },
        {
          id: "6",
          code: "he130268",
          email: "minhhqhe130268@fpt.edu.vn",
          realName: "Ho Quang sqsqs",
          dob: "2020-12-12"
        },
        {
          id: "7",
          code: "he130268",
          email: "minhhqhe130268@fpt.edu.vn",
          realName: "Ho Quang sqsqs",
          dob: "2020-12-12"
        },
        {
          id: "8",
          code: "he130268",
          email: "minhhqhe130268@fpt.edu.vn",
          realName: "Ho Quang sqsqs",
          dob: "2020-12-12"
        },
        {
          id: "9",
          code: "he130268",
          email: "minhhqhe130268@fpt.edu.vn",
          realName: "Ho Quang sqsqs",
          dob: "2020-12-12"
        },
        {
          id: "10",
          code: "he130268",
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

export function addStudent(student: UserTableInfo): AppThunk {
  return async (dispatch) => {
    const studentFormat: UserTableInfo = {
      id: "12121",
      code: student.code,
      email: student.email,
      realName: student.realName,
      dob: moment(student.dob).format("YYYY-MM-DD")
    };

    dispatch(addStudentToList(studentFormat));
  };
}
export function deleteStudents(userIds: string[]): AppThunk {
  return async (dispatch) => {
    console.log(JSON.stringify(userIds));
    dispatch(removeStudentsFromList(userIds));
  };
}

export function updateStudents(students: UserTableInfo[]): AppThunk {
  return async (dispatch) => {
    // console.log(JSON.stringify(students));
    dispatch(updateStudentList(students));
  };
}
