import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserInfo {
  id: string;
  userName: string;
  realName: string;
  avatar: string;
}

const initialState: UserInfo[] = [];

const userListSlice = createSlice({
  name: "userListSlice",
  initialState,
  reducers: {
    setUserInfoList(state, action: PayloadAction<UserInfo[]>) {
      state = action.payload;
      return state;
    }
  }
});

export default userListSlice.reducer;
export const { setUserInfoList } = userListSlice.actions;
