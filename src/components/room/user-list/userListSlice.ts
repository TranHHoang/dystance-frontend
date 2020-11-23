import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "~utils/index";

const initialState: User[] = [];

const userListSlice = createSlice({
  name: "userListSlice",
  initialState,
  reducers: {
    setUserInfoList(state, action: PayloadAction<User[]>) {
      state = action.payload;
      return state;
    }
  }
});

export default userListSlice.reducer;
export const { setUserInfoList } = userListSlice.actions;
