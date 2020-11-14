import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SemesterPageState {
  tabsetValue: string;
}

const initialState: SemesterPageState = {
  tabsetValue: ""
};

const semesterPageSlice = createSlice({
  name: "semesterPageSlice",
  initialState,
  reducers: {
    setSemesterPageTabsetValue(state, action: PayloadAction<string>) {
      state.tabsetValue = action.payload;
    }
  }
});

export default semesterPageSlice.reducer;
export const { setSemesterPageTabsetValue } = semesterPageSlice.actions;
