import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "~app/store";
import { ErrorResponse, User, get } from "~utils/index";
import { AxiosError } from "axios";
import { TimetableEvent } from "../Timetable";

interface EventDetailsState {
  isDrawerOpen: boolean;
  event: TimetableEvent;
  teacher: User;
  error?: ErrorResponse;
}

const initialState: EventDetailsState = {
  isDrawerOpen: false,
  event: null,
  teacher: null
};

const eventDetailsSlice = createSlice({
  name: "eventDetailsSice",
  initialState,
  reducers: {
    setDrawerOpen(state, action: PayloadAction<boolean>) {
      state.isDrawerOpen = action.payload;
    },
    setEvent(state, action: PayloadAction<TimetableEvent>) {
      state.event = action.payload;
    },
    fetchTeacherInfoSuccess(state, action: PayloadAction<User>) {
      state.teacher = action.payload;
    },
    fetchTeacherInfoFailed(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    }
  }
});
export default eventDetailsSlice.reducer;
export const { setDrawerOpen, setEvent, fetchTeacherInfoSuccess, fetchTeacherInfoFailed } = eventDetailsSlice.actions;

export function showTeacherInfo(teacherId: string): AppThunk {
  return async (dispatch) => {
    try {
      const response = await get(`/users/info?id=${teacherId}`);
      const data = response.data as User;
      dispatch(fetchTeacherInfoSuccess(data));
    } catch (ex) {
      const e = ex as AxiosError;

      if (e.response?.data) {
        dispatch(fetchTeacherInfoFailed(e.response.data as ErrorResponse));
      } else if (e.request) {
        dispatch(
          fetchTeacherInfoFailed({
            type: 2,
            message: "Something Went Wrong"
          })
        );
      } else {
        dispatch(
          fetchTeacherInfoFailed({
            type: 3,
            message: e.message
          })
        );
      }
    }
  };
}
