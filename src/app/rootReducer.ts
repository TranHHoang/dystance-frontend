import { combineReducers } from "@reduxjs/toolkit";
import postReducer from "../example/post/postSlice";
import loginReducer from "../components/account-management/login/loginSlice";
import googleUpdateInfoReducer from "../components/account-management/google-update-info/googleUpdateInfoSlice";
import registerReducer from "../components/account-management/register/registerSlice";
import { reducer as formReducer } from "redux-form";
import createRoomReducer from "../components/room-management/create-room/createRoomSlice";
import showRoomReducer from "../components/homepage/showRoomsSlice";

const rootReducer = combineReducers({
  posts: postReducer,
  roomCreation: createRoomReducer,
  showRoomState: showRoomReducer,
  loginState: loginReducer,
  googleUpdateInfoState: googleUpdateInfoReducer,
  registerState: registerReducer,
  form: formReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
