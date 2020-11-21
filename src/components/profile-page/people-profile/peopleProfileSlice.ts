import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { AppThunk } from "~app/store";
import { get } from "~utils/axiosUtils";
import { ErrorResponse, User } from "~utils/types";

interface PeopleProfileState {
  userId: string;
  peopleProfileModalOpen: boolean;
  user: User;
  error?: ErrorResponse;
  roomId: string;
}

const initialState: PeopleProfileState = {
  userId: null,
  peopleProfileModalOpen: false,
  user: null,
  roomId: null
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
    },
    setCreatorProfileOpen(state, action: PayloadAction<{ roomId: string; peopleProfileModalOpen: boolean }>) {
      state.roomId = action.payload.roomId;
      state.peopleProfileModalOpen = action.payload.peopleProfileModalOpen;
    }
  }
});
export default peopleProfileSlice.reducer;
export const {
  setPeopleProfileModalOpen,
  fetchPeopleProfileSuccess,
  fetchPeopleProfileFailure,
  setCreatorProfileOpen
} = peopleProfileSlice.actions;

export function showPeopleProfile(userId: string): AppThunk {
  return async (dispatch) => {
    try {
      const response = await get(`/users/info?id=${userId}`);
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
