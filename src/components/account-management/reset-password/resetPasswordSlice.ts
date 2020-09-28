import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createHashHistory } from "history";
import { hostName } from "~utils/hostUtils";
import { ErrorResponse } from "~utils/types";
import Axios from "~utils/fakeAPI";
import { AxiosError, AxiosResponse } from "axios";
import { AppThunk } from "~app/store";

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

      const response: AxiosResponse<SendEmailResponse> = await Axios.post(
        `${hostName}/api/users/resetPassword/send`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      dispatch(requestSuccess());
      dispatch(addEmail(response.data.email));
    } catch (ex) {
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

      await Axios.post(`${hostName}/api/users/resetPassword/verify`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

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

      await Axios.post(`${hostName}/api/users/resetPassword/update`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      dispatch(requestSuccess());
      createHashHistory().replace("/login");
    } catch (ex) {
      dispatch(getAxiosError(ex as AxiosError));
    }
  };
}
