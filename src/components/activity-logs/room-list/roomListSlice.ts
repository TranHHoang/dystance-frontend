import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import _ from "lodash";
import { AppThunk } from "~app/store";
import { get } from "~utils/axiosUtils";
import { allUsers, ErrorResponse, Room, Semester } from "~utils/types";

interface RoomListState {
  semesters: Semester[];
  isLoading: boolean;
  rooms: Room[];
  error?: ErrorResponse;
  selectedRoom: string;
}

const initialState: RoomListState = {
  semesters: [],
  isLoading: true,
  rooms: [],
  selectedRoom: ""
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
    fetchRoomsSuccess(state, action: PayloadAction<Room[]>) {
      state.isLoading = false;
      state.rooms = action.payload;
    },
    fetchRoomsFailed(state, action: PayloadAction<ErrorResponse>) {
      state.isLoading = false;
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
  setSelectedRoom
} = roomListSlice.actions;

export function getSemesters(): AppThunk {
  return async (dispatch) => {
    try {
      const response = await get("/semesters");
      // const data = response.data as Semester[];
      const data = [
        {
          id: "1",
          name: "Semester Spring 2020"
        },
        {
          id: "2",
          name: "FU 2020"
        }
      ];
      dispatch(fetchSemestersSuccess(data));
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
      const data = [
        {
          roomId: "65",
          roomName: "SWD301.IS1301",
          teacherId: "aed9e96f-975e-44fb-920f-3cdcf32bc2bf"
        },
        {
          roomId: "23",
          roomName: "ACC101.IS1302",
          teacherId: "aed9e96f-975e-44fb-920f-3cdcf32bc2bf"
        }
      ];

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
