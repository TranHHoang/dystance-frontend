import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { hostName } from "$utils/hostUtils";
import { AppThunk } from "$app/store";
import { createHashHistory } from "history";
import Axios from "$utils/fakeApi";
import { saveLoginData } from "$utils/tokenStorage";

interface ErrorResponse {
  type: number;
  message: string;
}

interface OkResponse {
  id: string;
  userName: string;
  token: string;
  refreshToken: string;
  expire: number;
  isLoading: boolean;
  error: ErrorResponse | null;
}

const initialState: OkResponse = {
  id: "",
  userName: "",
  token: "",
  refreshToken: "",
  expire: 0,
  isLoading: false,
  error: null
};

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true;
    },
    loginSuccess(state, action: PayloadAction<OkResponse>) {
      state.isLoading = false;
      state = action.payload;
    },
    loginFailed(state, action: PayloadAction<ErrorResponse>) {
      state.isLoading = false;
      state.error = action.payload;
    }
  }
});

export default loginSlice.reducer;
export const { loginStart, loginSuccess, loginFailed } = loginSlice.actions;

function postForm(url: string, form: FormData): Promise<AxiosResponse<any>> {
  return Axios.post(url, form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
}

export function startLogin(
  email: string | null,
  userName: string | null,
  password: string,
  googleTokenId: string | null
): AppThunk {
  return async (dispatch) => {
    let response: AxiosResponse<OkResponse | ErrorResponse | any>;
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
        form.append("password", password);
        email && form.append("email", email);

        response = await postForm(`${hostName}/api/users/login`, form);
      }

      if (response.status === 200) {
        const data = response.data as OkResponse;

        dispatch(loginSuccess(data));
        await saveLoginData(data.userName, {
          id: data.id,
          userName: data.userName,
          token: data.token,
          refreshToken: data.refreshToken
        });

        createHashHistory().push("/register"); // TODO: homepage
      }
    } catch (e) {
      console.log(e.response);
      dispatch(loginFailed(e.response.data as ErrorResponse));
    }
  };
}

export function resendEmail(userName: string | null, email: string | null): AppThunk {
  return async (dispatch) => {
    try {
      const response = await Axios.get(`${hostName}/api/users/resendEmail?email=${email}`);
      if (response.status === 200) {
      }
    } catch (e) {}
  };
}
