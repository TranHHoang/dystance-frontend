import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosResponse, AxiosError } from "axios";
import { hostName } from "~utils/hostUtils";
import { UserLoginData } from "~utils/types";
import { AppThunk } from "~app/store";
import { createHashHistory } from "history";
import Axios from "~utils/fakeAPI";
import { saveLoginData } from "~utils/tokenStorage";

export enum LoginError {
  NameEmailPasswordIncorrect,
  EmailIsNotConfirmed,
  Other
}

export interface ErrorResponse {
  type: number;
  message: string;
}

export type OkResponse = UserLoginData;

interface LoginFormState {
  isLoading: boolean;
  error?: ErrorResponse;
  isLoginSuccess: boolean;
  resendEmailLoading?: boolean;
  resendEmailError?: string;
}

const initialState: LoginFormState = {
  isLoading: false,
  isLoginSuccess: false
};

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true;
    },
    loginSuccess(state) {
      state.isLoading = false;
      state.isLoginSuccess = true;
      state.error = undefined;
    },
    loginFailed(state, action: PayloadAction<ErrorResponse>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    resendEmailStart(state) {
      state.resendEmailLoading = true;
    },
    resendEmailSuccess(state) {
      state.resendEmailLoading = false;
    },
    resendEmailError(state, action: PayloadAction<string>) {
      state.resendEmailLoading = false;
      state.resendEmailError = action.payload;
    },
    resetLoginState(state) {
      state.error = undefined;
    }
  }
});

export default loginSlice.reducer;
export const {
  loginStart,
  loginSuccess,
  loginFailed,
  resendEmailStart,
  resendEmailSuccess,
  resendEmailError,
  resetLoginState
} = loginSlice.actions;

function postForm(url: string, form: FormData): Promise<AxiosResponse<any>> {
  return Axios.post(url, form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
}

function getAxiosError(e: AxiosError) {
  return loginFailed(
    e.response?.data ? (e.response.data as ErrorResponse) : { type: LoginError.Other, message: "Something went wrong" }
  );
}

export function startLogin(email?: string, userName?: string, password?: string, googleTokenId?: string): AppThunk {
  return async (dispatch) => {
    let response: AxiosResponse<OkResponse | ErrorResponse>;
    dispatch(loginStart());

    try {
      if (googleTokenId) {
        // Google login
        const form = new FormData();
        form.append("tokenId", googleTokenId);

        response = await postForm(`${hostName}/api/users/google`, form);
      } else {
        // normal login
        const form = new FormData();
        userName && form.append("userName", userName);
        email && form.append("email", email);
        password && form.append("password", password);

        response = await postForm(`${hostName}/api/users/login`, form);
      }

      const data = response.data as OkResponse;
      dispatch(loginSuccess());

      saveLoginData({
        id: data.id,
        userName: data.userName,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      });

      createHashHistory().push("/profile");
    } catch (ex) {
      const e = ex as AxiosError;
      // Google login first time
      if (googleTokenId && e.response?.status === 404) {
        dispatch(loginSuccess());
        createHashHistory().push("/googleUpdateInfo");
      } else {
        dispatch(getAxiosError(ex as AxiosError));
      }
    }
  };
}

export function resendEmail(userName?: string, email?: string): AppThunk {
  return async (dispatch) => {
    dispatch(resendEmailStart());

    try {
      const form = new FormData();
      userName && form.append("userName", userName);
      email && form.append("email", email);

      await postForm(`${hostName}/api/users/resendEmail`, form);

      dispatch(resendEmailSuccess());
    } catch (ex) {
      dispatch(resendEmailError((ex as AxiosError).message));
    }
  };
}
