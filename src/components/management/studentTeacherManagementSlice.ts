import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import _ from "lodash";
import { AppThunk } from "~app/store";
import { ErrorResponse, post, fetchAllUsers } from "~utils/index";
import { showStudentList } from "./student/StudentListSlice";
import { FileUploadFormValues } from "./StudentTeacherManagement";
import { showTeacherList } from "./teacher/teacherListSlice";

interface StudentTeacherManagementState {
  isLoading: boolean;
  isUploadSuccess: boolean;
  errors?: ErrorResponse[];
}

const initialState: StudentTeacherManagementState = {
  isLoading: false,
  isUploadSuccess: false,
  errors: []
};

const studentTeacherManageSlice = createSlice({
  name: "studentTeacherManageSlice",
  initialState,
  reducers: {
    startFileUpload(state) {
      state.isLoading = true;
    },
    fileUploadSuccess(state) {
      state.isLoading = false;
      state.isUploadSuccess = true;
    },
    fileUploadFailed(state, action: PayloadAction<ErrorResponse>) {
      state.isLoading = false;
      state.isUploadSuccess = false;
      state.errors = state.errors.concat(action.payload);
    },
    resetFileUploadError(state) {
      state.errors = [];
    }
  }
});

export default studentTeacherManageSlice.reducer;
export const {
  startFileUpload,
  fileUploadFailed,
  fileUploadSuccess,
  resetFileUploadError
} = studentTeacherManageSlice.actions;

export function uploadFile({ file }: FileUploadFormValues): AppThunk {
  return async (dispatch) => {
    dispatch(startFileUpload());
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("file", file);

      const data = (await post("/users/accounts", form)).data;
      if (data.success.length > 0) {
        dispatch(fileUploadSuccess());
        await fetchAllUsers();
      }
      if (data.failed.length > 0) {
        dispatch(fileUploadFailed(data.failed));
      }
      dispatch(showStudentList());
      dispatch(showTeacherList());
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(fileUploadFailed(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          fileUploadFailed({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          fileUploadFailed({
            message: ex.message,
            type: 4
          })
        );
      }
    }
  };
}
