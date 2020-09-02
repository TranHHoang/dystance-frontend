import { combineReducers } from "@reduxjs/toolkit";
import postReducer from "../example/post/postSlice";

const rootReducer = combineReducers({
  posts: postReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
