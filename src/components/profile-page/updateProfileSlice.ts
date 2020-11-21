import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { fetchAllUsers } from "../../components/homepage/showRoomsSlice";
import moment from "moment";
import { AppThunk } from "~app/store";
import { ErrorResponse, User } from "~utils/types";
import { UpdateProfileFormValues } from "./ProfilePage";
import { setProfileInfo } from "./showProfileInfoSlice";
import { post } from "~utils/axiosUtils";

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
      state.isUpdateSuccess = false;
      state.error = action.payload;
    },
    resetUpdateProfileState() {
      return initialState;
    }
  }
});

export default updateProfileSlice.reducer;
export const {
  changePasswordStart,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  cancelChangePassword,
  resetUpdateProfileState
} = updateProfileSlice.actions;

export function updateProfile({ realName, dob, newAvatar, password, newPassword }: UpdateProfileFormValues): AppThunk {
  return async (dispatch) => {
    dispatch(updateProfileStart());
    console.log("Update Start");

    try {
      const fd = new FormData();
      fd.append("realName", realName.trim());
      fd.append("dob", moment(dob).format("YYYY-MM-DD"));
      fd.append("avatar", newAvatar);
      fd.append("currentPassword", password.trim());
      fd.append("newPassword", newPassword.trim());

      const response = await post(`/users/updateProfile`, fd);
      const data = response.data as User;

      localStorage.setItem("profile", JSON.stringify(response.data));

      dispatch(setProfileInfo(data));
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
