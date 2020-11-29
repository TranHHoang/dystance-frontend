import { AnyAction, combineReducers } from "@reduxjs/toolkit";
import loginReducer from "../components/account/login/loginSlice";
import registerReducer from "../components/account/register/registerSlice";
import createRoomReducer from "../components/room-management/create-room/createRoomSlice";
import showRoomReducer from "../components/homepage/showRoomsSlice";
import chatReducer from "../components/chat/chatSlice";
import resetPasswordReducer from "../components/account/reset-password/resetPasswordSlice";
import { ResetStoreAction } from "../components/account/signout/signOut";
import showProfileReducer from "../components/profile-page/showProfileInfoSlice";
import updateProfileReducer from "../components/profile-page/updateProfileSlice";
import sidebarReducer from "../components/sidebar/sidebarSlice";
import roomReducer from "../components/room/room-component/roomSlice";
import jitsiMeetReducer from "../components/room/jitsi-meet-component/jitsiMeetSlice";
import userListReducer from "../components/room/user-list/userListSlice";
import peopleProfileReducer from "../components/profile-page/people-profile/peopleProfileSlice";
import userCardReducer from "../components/room/user-list/user-card/userCardSlice";
import timetableReducer from "../components/timetable/timetableSlice";
import eventDetailsReducer from "../components/timetable/event-details/eventDetailsSlice";
import remoteControlReducer from "../components/room/remote-control/remoteControlSlice";
import chatPreviewReducer from "../components/private-chat/chatPreviewSlice";
import groupReducer from "../components/room/group/groupSlice";
import semesterReducer from "../components/management/semester/semesterSlice";
import scheduleReducer from "../components/management/schedule/scheduleSlice";
import roomListReducer from "../components/activity-logs/room-list/roomListSlice";
import activityLogReducer from "../components/activity-logs/activityLogsSlice";
import studentListReducer from "../components/management/student/StudentListSlice";
import teacherListReducer from "../components/management/teacher/teacherListSlice";
import studentTeacherManagementReducer from "../components/management/studentTeacherManagementSlice";
import classListReducer from "../components/management/class/classListSlice";
import accountListReducer from "../components/management/account/accountListSlice";
import attendanceReportReducer from "../components/attendance-reports/attendanceReportSlice";

const appReducer = combineReducers({
  roomCreation: createRoomReducer,
  showRoomState: showRoomReducer,
  loginState: loginReducer,
  registerState: registerReducer,
  chatState: chatReducer,
  resetPasswordState: resetPasswordReducer,
  showProfileState: showProfileReducer,
  updateProfileState: updateProfileReducer,
  sidebarState: sidebarReducer,
  roomState: roomReducer,
  jitisiMeetState: jitsiMeetReducer,
  userListState: userListReducer,
  peopleProfileState: peopleProfileReducer,
  userCardState: userCardReducer,
  timetableState: timetableReducer,
  eventDetailsState: eventDetailsReducer,
  remoteControlState: remoteControlReducer,
  chatPreviewState: chatPreviewReducer,
  groupState: groupReducer,
  semesterState: semesterReducer,
  scheduleState: scheduleReducer,
  studentListState: studentListReducer,
  teacherListState: teacherListReducer,
  studentTeacherManagementState: studentTeacherManagementReducer,
  classListState: classListReducer,
  roomListState: roomListReducer,
  activityLogState: activityLogReducer,
  accountListState: accountListReducer,
  attendanceReportState: attendanceReportReducer
});

const rootReducer = (state: any, action: AnyAction) => {
  if (action.type === ResetStoreAction) {
    state = undefined;
  }
  return appReducer(state, action);
};

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
