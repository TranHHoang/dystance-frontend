import { combineReducers } from "@reduxjs/toolkit";
import postReducer from "../example/post/postSlice";
import createRoomReducer from "../components/room-management/create-room/createRoomSlice";
import { reducer as formReducer } from "redux-form";

const rootReducer = combineReducers({
  posts: postReducer,
  createRoomState: createRoomReducer,
  form: formReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
