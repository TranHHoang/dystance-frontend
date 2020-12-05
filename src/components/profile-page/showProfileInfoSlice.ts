import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { AppThunk } from "~app/store";
import { User, ErrorResponse, getLoginData, get } from "~utils/index";

interface ShowProfileState {
  isLoading: boolean;
  user: User;
  error?: ErrorResponse;
}

const initialState: ShowProfileState = {
  isLoading: false,
  user: JSON.parse(localStorage.getItem("profile")) as User
};

const showProfileSlice = createSlice({
  name: "showProfile",
  initialState,
  reducers: {
    fetchProfileSuccess(state, action: PayloadAction<User>) {
      state.isLoading = false;
      state.user = action.payload;
    },
    fetchProfileFailure(state, action: PayloadAction<ErrorResponse>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    setProfileInfo(state, action: PayloadAction<User>) {
      state.user = action.payload;
    }
  }
});

export default showProfileSlice.reducer;
export const { fetchProfileSuccess, fetchProfileFailure, setProfileInfo } = showProfileSlice.actions;

export function showProfile(): AppThunk {
  return async (dispatch) => {
    try {
      const response = await get(`/users/info?id=${getLoginData().id}`);
      localStorage.setItem("profile", JSON.stringify(response.data));

      const data = response.data as User;
      dispatch(fetchProfileSuccess(data));
    } catch (ex) {
      const e = ex as AxiosError;

      if (e.response?.data) {
        dispatch(fetchProfileFailure(e.response.data as ErrorResponse));
      } else if (e.request) {
        dispatch(
          fetchProfileFailure({
            type: 2,
            message: "Something Went Wrong"
          })
        );
      } else {
        dispatch(
          fetchProfileFailure({
            type: 3,
            message: e.message
          })
        );
      }
    }
  };
}
