import { combineReducers } from "@reduxjs/toolkit";
import postReducer from "../example/post/postSlice";
import createRoomReducer from "../components/room-management/create-room/createRoomSlice";
import { reducer as formReducer } from "redux-form";
import showRoomReducer from "../components/homepage/showRoomsSlice";
const rootReducer = combineReducers({
  posts: postReducer,
  roomCreation: createRoomReducer,
  showRoomState: showRoomReducer,
  form: formReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
