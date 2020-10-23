import { AnyAction, combineReducers } from "@reduxjs/toolkit";
import loginReducer from "../components/account-management/login/loginSlice";
import googleUpdateInfoReducer from "../components/account-management/google-update-info/googleUpdateInfoSlice";
import registerReducer from "../components/account-management/register/registerSlice";
import createRoomReducer from "../components/room-management/create-room/createRoomSlice";
import showRoomReducer from "../components/homepage/showRoomsSlice";
import chatReducer from "../components/chat/chatSlice";
import singleRoomReducer from "../components/homepage/single-room/singleRoomSlice";
import resetPasswordReducer from "../components/account-management/reset-password/resetPasswordSlice";
import inviteReducer from "../components/room/invite/inviteSlice";
import { ResetStoreAction } from "../components/account-management/signout/signOut";
import showProfileReducer from "../components/profile-page/showProfileInfoSlice";
import updateProfileReducer from "../components/profile-page/updateProfileSlice";
import sidebarReducer from "../components/sidebar/sidebarSlice";
import roomReducer from "../components/room/room-component/roomSlice";
import jitsiMeetReducer from "../components/room/jitsi-meet-component/jitsiMeetSlice";
import userListReducer from "../components/room/user-list/userListSlice";
import peopleProfileReducer from "../components/profile-page/people-profile/peopleProfileSlice";
import userCardReducer from "../components/room/user-list/user-card/userCardSlice";
import deadlineListReducer from "../components/room/deadline/deadlineListSlice";
import deadlineCardReducer from "../components/room/deadline/deadline-card/deadlineCardSlice";
import timetableReducer from "../components/timetable/timetableSlice";
import eventDetailsReducer from "../components/timetable/event-details/eventDetailsSlice";
import remoteControlReducer from "../components/room/remote-control/remoteControlSlice";
import chatPreviewReducer from "../components/private-chat/chatPreviewSlice";

const appReducer = combineReducers({
  roomCreation: createRoomReducer,
  showRoomState: showRoomReducer,
  loginState: loginReducer,
  googleUpdateInfoState: googleUpdateInfoReducer,
  registerState: registerReducer,
  chatState: chatReducer,
  singleRoomState: singleRoomReducer,
  resetPasswordState: resetPasswordReducer,
  inviteState: inviteReducer,
  showProfileState: showProfileReducer,
  updateProfileState: updateProfileReducer,
  sidebarState: sidebarReducer,
  roomState: roomReducer,
  jitisiMeetState: jitsiMeetReducer,
  userListState: userListReducer,
  peopleProfileState: peopleProfileReducer,
  userCardState: userCardReducer,
  deadlineListState: deadlineListReducer,
  deadlineCardState: deadlineCardReducer,
  timetableState: timetableReducer,
  eventDetailsState: eventDetailsReducer,
  remoteControlState: remoteControlReducer,
  chatPreviewState: chatPreviewReducer
});

const rootReducer = (state: any, action: AnyAction) => {
  if (action.type === ResetStoreAction) {
    state = undefined;
  }
  return appReducer(state, action);
};

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
