import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { AppThunk } from "~app/store";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";
import { ErrorResponse, User } from "~utils/types";

interface PeopleProfileState {
  userId: string;
  peopleProfileModalOpen: boolean;
  user: User;
  error?: ErrorResponse;
}

const initialState: PeopleProfileState = {
  userId: null,
  peopleProfileModalOpen: false,
  user: null
};

const peopleProfileSlice = createSlice({
  name: "peopleProfile",
  initialState,
  reducers: {
    setPeopleProfileModalOpen(state, action: PayloadAction<{ userId: string; peopleProfileModalOpen: boolean }>) {
      state.userId = action.payload.userId;
      state.peopleProfileModalOpen = action.payload.peopleProfileModalOpen;
    },
    fetchPeopleProfileSuccess(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    fetchPeopleProfileFailure(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    }
  }
});
export default peopleProfileSlice.reducer;
export const {
  setPeopleProfileModalOpen,
  fetchPeopleProfileSuccess,
  fetchPeopleProfileFailure
} = peopleProfileSlice.actions;

export function showPeopleProfile(userId: string): AppThunk {
  return async (dispatch) => {
    try {
      const response = await Axios.get(`${hostName}/api/users/info?id=${userId}`);
      const data = response.data as User;
      dispatch(fetchPeopleProfileSuccess(data));
    } catch (ex) {
      const e = ex as AxiosError;

      if (e.response?.data) {
        dispatch(fetchPeopleProfileFailure(e.response.data as ErrorResponse));
      } else if (e.request) {
        dispatch(
          fetchPeopleProfileFailure({
            type: 2,
            message: "Something Went Wrong"
          })
        );
      } else {
        dispatch(
          fetchPeopleProfileFailure({
            type: 3,
            message: e.message
          })
        );
      }
    }
  };
}
