import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { createHashHistory } from "history";
import moment from "moment";
import { AppThunk } from "~app/store";
import { post, saveLoginData } from "~utils/index";
import { ErrorResponse, LoginLocalStorageKey } from "~utils/interfaces";
import { OkResponse } from "../login/loginSlice";
import { GoogleUpdateInfoFormValues } from "./GoogleUpdateInfo";

export enum GoogleUpdateInfoError {
  UserNameAlreadyExists,
  Other
}

interface GoogleUpdateInfoFormState {
  isLoading: boolean;
  isUpdateInfoSuccess: boolean;
  error?: ErrorResponse;
}

const initialState: GoogleUpdateInfoFormState = {
  isLoading: false,
  isUpdateInfoSuccess: false
};

const googleUpdateInfoSlice = createSlice({
  name: "googleUpdateInfo",
  initialState,
  reducers: {
    updateInfoStart(state) {
      state.isLoading = true;
    },
    updateInfoSuccess(state) {
      state.isLoading = false;
      state.isUpdateInfoSuccess = true;
      state.error = undefined;
    },
    updateInfoFailed(state, action: PayloadAction<ErrorResponse>) {
      state.isLoading = false;
      state.error = action.payload;
    }
  }
});

export default googleUpdateInfoSlice.reducer;
export const { updateInfoStart, updateInfoSuccess, updateInfoFailed } = googleUpdateInfoSlice.actions;

function getAxiosError(e: AxiosError) {
  return updateInfoFailed(
    e.response?.data
      ? (e.response.data as ErrorResponse)
      : { type: GoogleUpdateInfoError.Other, message: "Something went wrong" }
  );
}
export function startGoogleUpdateInfo({ userName, realName, dob }: GoogleUpdateInfoFormValues): AppThunk {
  return async (dispatch) => {
    dispatch(updateInfoStart());

    const form = new FormData();
    form.append("email", localStorage.getItem(LoginLocalStorageKey.GoogleEmail));
    form.append("userName", userName);
    form.append("realName", realName);
    form.append("dob", moment(dob).format("YYYY-MM-DD"));

    try {
      const response = await post(`/users/google/updateInfo`, form);

      dispatch(updateInfoSuccess());

      const data = response.data as OkResponse;

      saveLoginData({
        id: data.id,
        userName: data.userName,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      });

      createHashHistory().push("/homepage");
    } catch (ex) {
      dispatch(getAxiosError(ex as AxiosError));
    }
  };
}
