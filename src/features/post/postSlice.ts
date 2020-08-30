import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Post {
    id: number;
    title: string;
    content: string;
}

const initialState = [{ id: 1, title: "test", content: "aaaaa" }];

const postSlice = createSlice({
    name: "posts",
    initialState,
    reducers: {
        postAdded(state, action: PayloadAction<Post>): void {
            state.push(action.payload);
        }
    }
});

export default postSlice.reducer;
export const { postAdded } = postSlice.actions;
