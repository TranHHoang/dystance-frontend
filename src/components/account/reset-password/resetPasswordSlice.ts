import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError, AxiosResponse } from "axios";
import { createHashHistory } from "history";
import { AppThunk } from "~app/store";
import { ErrorResponse, post } from "~utils/index";

interface ResetPasswordState {
  isLoading: boolean;
  currentStep: number;
  email?: string;
  error?: ErrorResponse;
}

export enum ResetPasswordError {
  EmailIsInvalid,
  WrongOrExpiredToken,
  Other
}

interface SendEmailResponse {
  email: string;
  message: string;
}

const initialState: ResetPasswordState = {
  isLoading: false,
  currentStep: 0
};

const resetPasswordSlice = createSlice({
  name: "resetPassword",
  initialState,
  reducers: {
    resetState() {
      return initialState;
    },
    addEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
    resendAccessCode(state) {
      state.currentStep--;
    },
    resetError(state) {
      state.error = undefined;
    },
    requestStart(state) {
      state.isLoading = true;
    },
    requestSuccess(state) {
      state.isLoading = false;
      state.currentStep = Math.min(state.currentStep + 1, 2);
    },
    requestFailed(state, action: PayloadAction<ErrorResponse>) {
      state.isLoading = false;
      state.error = action.payload;
    }
  }
});

export default resetPasswordSlice.reducer;

export const {
  resetState,
  resendAccessCode,
  addEmail,
  resetError,
  requestStart,
  requestSuccess,
  requestFailed
} = resetPasswordSlice.actions;

function getAxiosError(e: AxiosError) {
  return requestFailed(
    e.response?.data
      ? (e.response.data as ErrorResponse)
      : { type: ResetPasswordError.Other, message: "Something went wrong" }
  );
}

export function startSendEmail(email: string): AppThunk {
  return async (dispatch) => {
    dispatch(requestStart());
    try {
      const form = new FormData();
      form.append("email", email);

      const response: AxiosResponse<SendEmailResponse> = await post(`/users/resetPassword/send`, form);

      dispatch(requestSuccess());
      dispatch(addEmail(response.data.email));
    } catch (ex) {
      console.log(ex as AxiosError);
      dispatch(getAxiosError(ex as AxiosError));
    }
  };
}

export function startVerifyCode(email: string, code: string): AppThunk {
  return async (dispatch) => {
    dispatch(requestStart());

    try {
      const form = new FormData();
      form.append("email", email);
      form.append("token", code);

      await post(`/users/resetPassword/verify`, form);

      dispatch(requestSuccess());
    } catch (ex) {
      dispatch(getAxiosError(ex as AxiosError));
    }
  };
}

export function startChangePasword(email: string, newPassword: string): AppThunk {
  return async (dispatch) => {
    dispatch(requestStart());

    try {
      const form = new FormData();
      form.append("email", email);
      form.append("newPassword", newPassword);

      await post(`/users/resetPassword/update`, form);

      dispatch(requestSuccess());
      createHashHistory().replace("/");
    } catch (ex) {
      dispatch(getAxiosError(ex as AxiosError));
    }
  };
}
