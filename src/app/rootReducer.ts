import { combineReducers } from "@reduxjs/toolkit";
import postReducer from "../example/post/postSlice";
import loginReducer from "../components/account-management/login/loginSlice";
import googleUpdateInfoReducer from "../components/account-management/google-update-info/googleUpdateInfoSlice";
import { reducer as formReducer } from "redux-form";

const rootReducer = combineReducers({
  posts: postReducer,
  loginState: loginReducer,
  googleUpdateInfoState: googleUpdateInfoReducer,
  form: formReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
