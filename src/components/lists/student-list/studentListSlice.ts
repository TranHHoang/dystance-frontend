import { createSlice, current, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import _ from "lodash";
import moment from "moment";
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
    addStudentToList(state, action: PayloadAction<UserTableInfo>) {
      state.students.push(action.payload);
    },
    updateStudentList(state, action: PayloadAction<UserTableInfo>) {
      _.find(state.students, { id: action.payload.id }).email = action.payload.email;
      _.find(state.students, { id: action.payload.id }).realName = action.payload.realName;
      _.find(state.students, { id: action.payload.id }).dob = action.payload.dob;
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

export function addStudent(student: UserTableInfo): AppThunk {
  return async (dispatch) => {
    const studentFormat: UserTableInfo = {
      id: "12121",
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

export function updateStudent(student: UserTableInfo): AppThunk {
  return async (dispatch) => {
    dispatch(updateStudentList(student));
  };
}
