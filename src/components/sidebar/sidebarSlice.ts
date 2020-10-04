import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SidebarState {
  sidebarValue: string;
}
const initialState: SidebarState = {
  sidebarValue: ""
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
