import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { AppThunk } from "~app/store";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";
import { getLoginData } from "~utils/tokenStorage";

interface SidebarState {
  sidebarValue: string;
}
const initialState: SidebarState = {
  sidebarValue: "Homepage"
};
const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    setSidebarValue(state, action: PayloadAction<string>) {
      state.sidebarValue = action.payload;
    }
  }
});
export default sidebarSlice.reducer;
export const { setSidebarValue } = sidebarSlice.actions;
