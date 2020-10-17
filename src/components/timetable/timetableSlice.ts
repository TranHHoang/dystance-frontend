import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "~app/store";
import { getLoginData } from "~utils/tokenStorage";
import { ErrorResponse, TimetableEvent } from "~utils/types";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";
import { AxiosError } from "axios";
import moment from "moment";

interface TimetableState {
  events: TimetableEvent[];
  error?: ErrorResponse;
}

const initialState: TimetableState = {
  events: []
};

const timetableSlice = createSlice({
  name: "timetableSlice",
  initialState,
  reducers: {
    fetchTimetableSuccess(state, action: PayloadAction<TimetableEvent[]>) {
      state.events = state.events.concat(action.payload);
    },
    fetchTimetableFailed(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    },
    resetTimetable() {
      return initialState;
    }
  }
});

export default timetableSlice.reducer;
export const { fetchTimetableSuccess, fetchTimetableFailed } = timetableSlice.actions;

export function showTimetableEvents(week: Date, endOfWeek: Date): AppThunk {
  return async (dispatch) => {
    try {
      const startDate = moment(week).format("YYYY-MM-DD");
      const endDate = moment(endOfWeek).format("YYYY-MM-DD");
      const id = getLoginData().id;
      // const response = await Axios.get(`${hostName}/api/timetable?id=${id}&startDate=${endDate}&endDate=${endDate}`);
      // const data = response.data as TimetableEvent[];
      const data: TimetableEvent[] = [
        {
          id: "1",
          eventType: 0, //0 for classroom, 1 for deadline
          roomId: "0",
          title: "hava",
          creatorId: "0ca89113-d4e8-4600-8a50-ba4d509cf764",
          description: "this is havana group class",
          startDate: "2020-10-11T00:00:00",
          endDate: "2020-10-11T01:00:00"
        },
        {
          id: "2",
          eventType: 0, //0 for classroom, 1 for deadline
          roomId: "0",
          title: "ACC",
          creatorId: "0ca89113-d4e8-4600-8a50-ba4d509cf764",
          description: "this is havana group class",
          startDate: "2020-10-12T00:00:00",
          endDate: "2020-10-12T01:00:00"
        },
        {
          id: "3",
          eventType: 0, //0 for classroom, 1 for deadline
          roomId: "0",
          title: "SWD",
          creatorId: getLoginData().id,
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In eget felis maximus velit sagittis lobortis a eu lectus. Quisque euismod eros a libero iaculis, id accumsan mauris convallis. Donec porta, nunc euismod interdum pharetra, mi neque posuere dolor, quis ullamcorper erat massa sit amet risus. Etiam id bibendum nisl. Suspendisse commodo elit a tortor maximus auctor. Mauris semper id nunc a aliquet. Sed consectetur mi quis est volutpat lacinia. Aliquam fermentum justo ut risus maximus ornare. Etiam tempus, leo vel sollicitudin consectetur, tellus felis luctus quam, eget varius lorem ante finibus risus.",
          startDate: "2020-10-14T07:30:00",
          endDate: "2020-10-14T09:00:00"
        },
        {
          id: "4",
          eventType: 1, //0 for classroom, 1 for deadline
          roomId: "1",
          title: "Deadline - HAVA Assignment",
          creatorId: "0ca89113-d4e8-4600-8a50-ba4d509cf764",
          description: "this is havana group class",
          startDate: "2020-10-11T23:00:00",
          endDate: "2020-10-11T23:00:00"
        }
      ];

      dispatch(fetchTimetableSuccess(data));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(fetchTimetableFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          fetchTimetableFailed({
            message: "Something Went Wrong",
            type: 1
          })
        );
      } else {
        dispatch(
          fetchTimetableFailed({
            message: ex.message,
            type: 2
          })
        );
      }
    }
  };
}
