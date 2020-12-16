import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError, AxiosResponse } from "axios";
import { createHashHistory } from "history";
import { AppThunk } from "~app/store";
import { ErrorResponse, post, saveLoginData, UserLoginData } from "~utils/index";

export enum LoginError {
  NameEmailPasswordIncorrect,
  EmailIsNotConfirmed,
  Other
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

        response = await post(`/users/google`, form);
      } else {
        // normal login
        const form = new FormData();
        userName && form.append("userName", userName);
        email && form.append("email", email);
        password && form.append("password", password);

        response = await post(`/users/login`, form);
      }

      const data = response.data as OkResponse;
      dispatch(loginSuccess());

      saveLoginData({
        id: data.id,
        userName: data.userName,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      });
      createHashHistory().push("/homepage");
    } catch (ex) {
      console.log(ex);
      dispatch(getAxiosError(ex as AxiosError));
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

      await post(`/users/resendEmail`, form);

      dispatch(resendEmailSuccess());
    } catch (ex) {
      dispatch(resendEmailError((ex as AxiosError).message));
    }
  };
}
