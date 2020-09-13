import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { hostName } from "$utils/hostUtils";
import { AppThunk } from "$app/store";
import { createHashHistory } from "history";
import Axios from "./registerApi.stub";

export enum RegisterError {
  EmailExists,
  UserNameExists,
  Other
}

interface ErrorResponse {
  type: number;
  message: string;
}

interface RegisterFormState {
  isLoading: boolean;
  error?: ErrorResponse;
}

const initialState: RegisterFormState = {
  isLoading: false
};

const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {
    registerStart(state) {
      state.isLoading = true;
    },
    registerSuccess(state) {
      state.isLoading = false;
    },
    registerFailed(state, action: PayloadAction<ErrorResponse>) {
      state.isLoading = false;
      state.error = action.payload;
    }
  }
});

export default registerSlice.reducer;
export const { registerStart, registerSuccess, registerFailed } = registerSlice.actions;

export function startRegister(
  email: string,
  userName: string,
  password: string,
  realName: string,
  dob: string
): AppThunk {
  return async (dispatch) => {
    dispatch(registerStart());

    try {
      // normal login
      const form = new FormData();
      form.append("userName", userName);
      form.append("password", password);
      form.append("email", email);
      form.append("realName", realName);
      form.append("dob", dob);

      await Axios.post(`${hostName}/api/users/register`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      dispatch(registerSuccess());
      createHashHistory().push("/");
    } catch (ex) {
      const e = ex as AxiosError;
      console.log(e.response);

      if (e.response && e.response.data) {
        // server responsed
        dispatch(registerFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        // no response
        dispatch(registerFailed({ type: RegisterError.Other, message: "No response from server" }));
      } else {
        dispatch(registerFailed({ type: RegisterError.Other, message: e.message }));
      }
    }
  };
}
