import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SemesterDetailsState {
  tabsetValue: string;
}

const initialState: SemesterDetailsState = {
  tabsetValue: ""
};

const semesterDetailsSlice = createSlice({
  name: "semesterPageSlice",
  initialState,
  reducers: {
    setSemesterDetailsTabsetValue(state, action: PayloadAction<string>) {
      state.tabsetValue = action.payload;
    }
  }
});

export default semesterDetailsSlice.reducer;
export const { setSemesterDetailsTabsetValue } = semesterDetailsSlice.actions;
