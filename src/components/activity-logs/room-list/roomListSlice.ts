import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import _ from "lodash";
import { AppThunk } from "~app/store";
import { ErrorResponse, get, hostName, Room, Semester } from "~utils/index";

interface RoomListState {
  semesters: Semester[];
  isLoading: boolean;
  rooms: Room[];
  error?: ErrorResponse;
  selectedRoom: string;
  selectedSemester: { name: string; label: string };
}

const initialState: RoomListState = {
  semesters: [],
  isLoading: true,
  rooms: [],
  selectedRoom: "",
  selectedSemester: { name: null, label: "" }
};

const roomListSlice = createSlice({
  name: "roomListSlice",
  initialState,
  reducers: {
    fetchSemestersSuccess(state, action: PayloadAction<Semester[]>) {
      state.semesters = action.payload;
    },
    fetchSemestersFailed(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    },
    setSelectedSemester(state, action: PayloadAction<{ name: string; label: string }>) {
      state.selectedSemester = action.payload;
    },
    fetchRoomsSuccess(state, action: PayloadAction<Room[]>) {
      state.isLoading = false;
      state.rooms = action.payload;
    },
    fetchRoomsFailed(state, action: PayloadAction<ErrorResponse>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    fetchAttendanceExportFailed(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    },
    setSelectedRoom(state, action: PayloadAction<string>) {
      state.selectedRoom = action.payload;
    },
    resetRoomListState(state) {
      state.isLoading = true;
      state.semesters = [];
      state.rooms = [];
      state.error = undefined;
    },
    resetRoomListError(state) {
      state.error = undefined;
    }
  }
});

export default roomListSlice.reducer;
export const {
  fetchRoomsFailed,
  fetchRoomsSuccess,
  fetchSemestersFailed,
  fetchSemestersSuccess,
  resetRoomListState,
  setSelectedRoom,
  resetRoomListError,
  setSelectedSemester,
  fetchAttendanceExportFailed
} = roomListSlice.actions;

export function getSemesters(): AppThunk {
  return async (dispatch) => {
    try {
      const response = await get("/semesters");
      const data = response.data as Semester[];
      dispatch(fetchSemestersSuccess(data));
      dispatch(setSelectedSemester({ name: _.last(data).id, label: _.last(data).name }));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(fetchSemestersFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          fetchSemestersFailed({
            message: "Something Went Wrong",
            type: 1
          })
        );
      } else {
        dispatch(
          fetchSemestersFailed({
            message: ex.message,
            type: 2
          })
        );
      }
    }
  };
}

export function getRooms(semesterId: string): AppThunk {
  return async (dispatch) => {
    try {
      const response = await get(`/rooms/getBySemesterId?id=${semesterId}`);
      const data = response.data as Room[];
      dispatch(fetchRoomsSuccess(data));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(fetchRoomsFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          fetchRoomsFailed({
            message: "Something Went Wrong",
            type: 1
          })
        );
      } else {
        dispatch(
          fetchRoomsFailed({
            message: ex.message,
            type: 2
          })
        );
      }
    }
  };
}
// export function exportAttendance(roomId: string, roomName: string) {
//   get(`/users/reports/attendance/export?roomId=${roomId}`).then(response => {
//     let a = document.createElement("a");
//     a.href = response.data;
//     a.download = `${roomName}.xlsx`;
//     a.click();
//     a.remove();
//   })
// }
export function exportAttendance(roomId: string, roomName: string): AppThunk {
  return async (dispatch) => {
    try {
      const response = await get(`/users/reports/attendance/export?roomId=${roomId}`);
      // const response = `${hostName}/api/users/getAvatar?fileName=default.png&realName=&userName=am`;
      const link = document.createElement("a");
      console.log(response);
      link.href = response.data;
      link.download = `${roomName}.xlsx`;
      link.click();
      link.remove();
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(fetchAttendanceExportFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          fetchAttendanceExportFailed({
            message: "Something Went Wrong",
            type: 1
          })
        );
      } else {
        dispatch(
          fetchAttendanceExportFailed({
            message: ex.message,
            type: 2
          })
        );
      }
    }
  };
}
