import { combineReducers } from "@reduxjs/toolkit";
import postReducer from "../example/post/postSlice";
import loginReducer from "../components/account-management/login/loginSlice";

const rootReducer = combineReducers({
  posts: postReducer,
  userCredential: loginReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
