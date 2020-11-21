import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { AppThunk } from "~app/store";
import { get, postJson } from "~utils/axiosUtils";

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

const attendanceReportSlice = createSlice({
  name: "attendanceReportSlice",
  initialState: [] as AttendanceReport[],
  reducers: {
    setAttendanceReports(_, action: PayloadAction<AttendanceReport[]>) {
      return action.payload;
    },
    updateStudentsStatus(state, action: PayloadAction<{ id: string; students: AttendanceReportStudent[] }>) {
      const students = _.find(state, { id: action.payload.id }).students;
      _.each(action.payload.students, (student) => {
        _.find(students, { id: student.id }).status = student.status;
      });
    }
  }
});

export default attendanceReportSlice.reducer;
const { setAttendanceReports, updateStudentsStatus } = attendanceReportSlice.actions;

export function fetchAttendanceReports(semesterId: string): AppThunk {
  return async (dispatch) => {
    try {
      // const data = (await get(`/users/reports/attendance?id=${getLoginData().id}&semesterId=${semesterId}`)).data;
      const data = [
        {
          id: "1",
          class: "IS1301",
          subject: "SWD301",
          date: "2020-02-12",
          startTime: "13:00",
          endTime: "14:00",
          teacher: "aed9e96f-975e-44fb-920f-3cdcf32bc2bf",
          status: "future"
        },
        {
          id: "2",
          class: "IS1302",
          subject: "SWD301",
          date: "2020-02-12",
          startTime: "13:00",
          endTime: "14:00",
          teacher: "aed9e96f-975e-44fb-920f-3cdcf32bc2bf",
          status: "absent"
        },
        {
          id: "3",
          class: "IS1301",
          subject: "SWD301",
          date: "2020-02-12",
          startTime: "13:00",
          endTime: "14:00",
          teacher: "aed9e96f-975e-44fb-920f-3cdcf32bc2bf",
          students: [
            {
              id: "aed9e96f-975e-44fb-920f-3cdcf32bc2bf",
              status: "present"
            }
          ]
        }
      ] as AttendanceReport[];
      dispatch(setAttendanceReports(data));
    } catch (ex) {
      console.log(ex);
    }
  };
}

export function updateAttendances(
  semesterId: string,
  attendance: { id: string; students: AttendanceReportStudent[] }
): AppThunk {
  return async (dispatch) => {
    try {
      // const data = (await postJson(`/users/reports/attendance/update?semesterId=${semesterId}`, attendance)).data;
      dispatch(updateStudentsStatus(attendance));
    } catch (ex) {
      console.log(ex);
    }
  };
}
