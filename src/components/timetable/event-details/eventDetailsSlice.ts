import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "~app/store";
import { hostName } from "~utils/hostUtils";
import { ErrorResponse, TimetableEvent, User } from "~utils/types";
import Axios from "~utils/fakeAPI";
import { AxiosError } from "axios";

interface EventDetailsState {
  isDrawerOpen: boolean;
  event: TimetableEvent;
  creator: User;
  error?: ErrorResponse;
}

const initialState: EventDetailsState = {
  isDrawerOpen: false,
  event: null,
  creator: null
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
    fetchCreatorInfoSuccess(state, action: PayloadAction<User>) {
      state.creator = action.payload;
    },
    fetchCreatorInfoFailed(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    }
  }
});
export default eventDetailsSlice.reducer;
export const { setDrawerOpen, setEvent, fetchCreatorInfoSuccess, fetchCreatorInfoFailed } = eventDetailsSlice.actions;

export function showCreatorInfo(creatorId: string): AppThunk {
  return async (dispatch) => {
    try {
      const response = await Axios.get(`${hostName}/api/users/info?id=${creatorId}`);
      const data = response.data as User;
      dispatch(fetchCreatorInfoSuccess(data));
    } catch (ex) {
      const e = ex as AxiosError;

      if (e.response?.data) {
        dispatch(fetchCreatorInfoFailed(e.response.data as ErrorResponse));
      } else if (e.request) {
        dispatch(
          fetchCreatorInfoFailed({
            type: 2,
            message: "Something Went Wrong"
          })
        );
      } else {
        dispatch(
          fetchCreatorInfoFailed({
            type: 3,
            message: e.message
          })
        );
      }
    }
  };
}
