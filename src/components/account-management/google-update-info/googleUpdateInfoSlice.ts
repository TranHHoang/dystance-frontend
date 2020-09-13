import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Axios, { AxiosError } from "axios";
import { hostName } from "~utils/hostUtils";
import { AppThunk } from "~app/store";
import { createHashHistory } from "history";
import { saveLoginData } from "~utils/tokenStorage";
import { ErrorResponse, OkResponse } from "../login/loginSlice";
import { LoginLocalStorageKey } from "../login/LoginForm";
import { GoogleUpdateInfoFormValues } from "./GoogleUpdateInfo";
import moment from "moment";

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
    form.append("email", window.localStorage.getItem(LoginLocalStorageKey.GoogleEmail));
    form.append("userName", userName);
    form.append("realName", realName);
    form.append("dob", moment(dob).format("YYYY-MM-DD"));

    try {
      const response = await Axios.post(`${hostName}/api/users/google/updateInfo`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      dispatch(updateInfoSuccess());

      const data = response.data as OkResponse;

      await saveLoginData(data.userName, {
        id: data.id,
        userName: data.userName,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      });

      createHashHistory().push("/");
    } catch (ex) {
      console.log(ex);

      dispatch(getAxiosError(ex as AxiosError));
    }
  };
}
