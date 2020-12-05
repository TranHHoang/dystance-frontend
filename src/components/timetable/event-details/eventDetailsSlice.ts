import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ErrorResponse } from "~utils/index";
import { TimetableEvent } from "../Timetable";

interface EventDetailsState {
  isDrawerOpen: boolean;
  event: TimetableEvent;
  error?: ErrorResponse;
}

const initialState: EventDetailsState = {
  isDrawerOpen: false,
  event: null
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
    }
  }
});

export default eventDetailsSlice.reducer;
export const { setDrawerOpen, setEvent } = eventDetailsSlice.actions;
