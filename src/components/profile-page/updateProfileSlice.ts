import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosResponse, AxiosError } from "axios";
import { hostName } from "~utils/hostUtils";
import { UserLoginData } from "~utils/types";
import { AppThunk } from "~app/store";
import { createHashHistory } from "history";
import Axios from "~utils/fakeAPI";
import { saveLoginData } from "~utils/tokenStorage";
import { UpdateProfileFormValues } from "./ProfilePage";
import moment from "moment";
export interface ErrorResponse {
  type: number;
  message: string;
}

interface UpdateProfileState {
  isLoading: boolean;
  isUpdateSuccess: boolean;
  error?: ErrorResponse;
  changePassword: boolean;
}

const initialState: UpdateProfileState = {
  isLoading: false,
  isUpdateSuccess: false,
  changePassword: false
};
const updateProfileSlice = createSlice({
  name: "updateProfile",
  initialState,
  reducers: {
    changePasswordStart(state) {
      state.changePassword = true;
    },
    cancelChangePassword(state) {
      state.changePassword = false;
    },
    updateProfileStart(state) {
      state.isLoading = true;
    },
    updateProfileSuccess(state) {
      state.isLoading = false;
      state.isUpdateSuccess = true;
      state.changePassword = false;
      state.error = undefined;
    },
    updateProfileFailure(state, action: PayloadAction<ErrorResponse>) {
      state.isLoading = false;
      state.error = action.payload;
    }
  }
});

export default updateProfileSlice.reducer;
export const {
  changePasswordStart,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  cancelChangePassword
} = updateProfileSlice.actions;

export function changePassword({ password, newPassword }: UpdateProfileFormValues): AppThunk {
  return async (dispatch) => {
    dispatch(changePasswordStart());
  };
}
export function updateProfile({ realName, dob, newAvatar, password, newPassword }: UpdateProfileFormValues): AppThunk {
  return async (dispatch) => {
    dispatch(updateProfileStart());
    try {
      const fd = new FormData();
      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };
      fd.append("realName", realName);
      fd.append("dob", moment(dob).format("YYYY-MM-DD"));
      fd.append("avatar", newAvatar);
      fd.append("currentPassword", password);
      fd.append("newPassword", newPassword);

      const response = await Axios.post(`${hostName}/api/users/updateInfo?id=1`, fd, config);
      localStorage.removeItem("profile");
      localStorage.setItem("profile", JSON.stringify(response.data));
      dispatch(updateProfileSuccess());
    } catch (ex) {
      const e = ex as AxiosError;

      if (e.response) {
        dispatch(updateProfileFailure(e.response.data as ErrorResponse));
      } else if (e.request) {
        dispatch(
          updateProfileFailure({
            type: 1,
            message: "Something went wrong"
          })
        );
      } else {
        dispatch(
          updateProfileFailure({
            type: 2,
            message: e.message
          })
        );
      }
    }
  };
}
