import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosResponse, AxiosError } from "axios";
import { hostName } from "~utils/hostUtils";
import { AppThunk } from "~app/store";
import Axios from "~utils/fakeAPI";
import { getLoginData } from "~utils/tokenStorage";

export interface ErrorResponse {
  type: number;
  message: string;
}

interface User {
  id: string;
  userName: string;
  realName: string;
  email: string;
  dob: string;
  password: string;
  newPassword: string;
  avatar: string;
}
interface ShowProfileState {
  isLoading: boolean;
  user?: User;
  error?: ErrorResponse;
}

const initialState: ShowProfileState = {
  isLoading: false
};
const showProfileSlice = createSlice({
  name: "updateProfile",
  initialState,
  reducers: {
    fetchProfileSuccess(state, action: PayloadAction<User>) {
      state.isLoading = true;
      state.user = action.payload;
    },
    fetchProfileFailure(state, action: PayloadAction<ErrorResponse>) {
      state.isLoading = false;
      state.error = action.payload;
    }
  }
});

export default showProfileSlice.reducer;
export const { fetchProfileSuccess, fetchProfileFailure } = showProfileSlice.actions;

export function showProfile(): AppThunk {
  return async (dispatch) => {
    try {
      if (!("profile" in localStorage)) {
        const response = await Axios.get(`${hostName}/api/users/info?id=${getLoginData().id}`);
        localStorage.setItem("profile", JSON.stringify(response.data));
      } else if ("profile" in localStorage) {
        const profile = JSON.parse(localStorage.getItem("profile")) as User;
        if (profile.id !== getLoginData().id) {
          localStorage.removeItem("profile");
          const response = await Axios.get(`${hostName}/api/users/info?id=${getLoginData().id}`);
          localStorage.setItem("profile", JSON.stringify(response.data));
        }
      }
      const data = JSON.parse(localStorage.getItem("profile")) as User;
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
