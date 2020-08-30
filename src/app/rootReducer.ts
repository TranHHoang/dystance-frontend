import { combineReducers } from "@reduxjs/toolkit";
import postReducer from "../features/post/postSlice";

const rootReducer = combineReducers({
    posts: postReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
