import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import _ from "lodash";
import { AppThunk } from "~app/store";
import { ErrorResponse, getLoginData, get, post } from "~utils/index";

export interface AttendanceReportStudent {
  id: string;
  status: "present" | "absent";
}

export interface AttendanceReport {
  id: string;
  subject: string;
  class: string;
  date: string;
  startTime: string;
  endTime: string;
  teacher: string;
  status?: "present" | "absent" | "future";
  students?: AttendanceReportStudent[];
}

interface AttendanceReportState {
  reports: AttendanceReport[];
  error?: ErrorResponse;
}
const initialState: AttendanceReportState = {
  reports: []
};

const attendanceReportSlice = createSlice({
  name: "attendanceReportSlice",
  initialState,
  reducers: {
    setAttendanceReports(state, action: PayloadAction<AttendanceReport[]>) {
      state.reports = action.payload;
    },
    updateStudentsStatus(state, action: PayloadAction<{ id: string; students: AttendanceReportStudent[] }>) {
      const students = _.find(state.reports, { id: action.payload.id }).students;
      _.each(action.payload.students, (student) => {
        _.find(students, { id: student.id }).status = student.status;
      });
    },
    setAttendanceError(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    },
    resetAttendanceError(state) {
      state.error = undefined;
    }
  }
});

export default attendanceReportSlice.reducer;
export const {
  setAttendanceReports,
  updateStudentsStatus,
  setAttendanceError,
  resetAttendanceError
} = attendanceReportSlice.actions;

export function fetchAttendanceReports(semesterId: string): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await get(`/users/reports/attendance?id=${getLoginData().id}&semesterId=${semesterId}`)).data;
      dispatch(setAttendanceReports(data));
    } catch (ex) {
      const e = ex as AxiosError;

      if (e.response) {
        dispatch(setAttendanceError(e.response.data as ErrorResponse));
      } else if (e.request) {
        dispatch(
          setAttendanceError({
            type: 3,
            message: "Something went wrong"
          })
        );
      } else {
        dispatch(
          setAttendanceError({
            type: 4,
            message: e.message
          })
        );
      }
    }
  };
}

export function updateAttendances(attendance: { id: string; students: AttendanceReportStudent[] }): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await post(`/users/reports/attendance/update`, attendance)).data;
      dispatch(updateStudentsStatus(data));
    } catch (ex) {
      const e = ex as AxiosError;

      if (e.response) {
        dispatch(setAttendanceError(e.response.data as ErrorResponse));
      } else if (e.request) {
        dispatch(
          setAttendanceError({
            type: 3,
            message: "Something went wrong"
          })
        );
      } else {
        dispatch(
          setAttendanceError({
            type: 4,
            message: e.message
          })
        );
      }
    }
  };
}
