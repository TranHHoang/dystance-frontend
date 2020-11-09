import React, { useEffect } from "react";
import { hot } from "react-hot-loader";
import LoginForm from "../components/account-management/login/LoginForm";
import GoogleUpdateInfoForm from "../components/account-management/google-update-info/GoogleUpdateInfo";
import { HomePage } from "../components/homepage/Homepage";
import { Route, Switch, HashRouter } from "react-router-dom";
import RegisterForm from "../components/account-management/register/RegisterForm";
import ChatArea from "../components/chat/ChatArea";
import ResetPasswordComponent from "../components/account-management/reset-password/ResetPasswordComponent";
import RoomComponent from "../components/room/room-component/RoomComponent";
import ProfilePage from "../components/profile-page/ProfilePage";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { hostName } from "~utils/hostUtils";
import { getLoginData } from "~utils/tokenStorage";
import { useDispatch, useSelector } from "react-redux";
import { initPrivateChatSocket } from "../components/private-chat/chatPreviewSlice";
import { RootState } from "./rootReducer";
import _ from "lodash";
import { RoomTimes } from "~utils/types";
import moment from "moment";
import { createNotification, NotificationType } from "~utils/notification";

export const socket = new HubConnectionBuilder().withUrl(`${hostName}/socket`).build();

export default hot(module)(function App() {
  const roomState = useSelector((root: RootState) => root.showRoomState);
  const deadlineListState = useSelector((root: RootState) => root.deadlineListState);
  const dispatch = useDispatch();

  useEffect(() => {
    if (socket && socket.state === "Disconnected") {
      console.log("Start socket...");
      socket.start().then(() => {
        console.log("Started");
        socket.invoke("ConnectionState", 0, getLoginData().id);
        dispatch(initPrivateChatSocket());
      });
    }

    _.each(deadlineListState.deadlines, (deadline) => {
      const hourDiff = moment.duration(moment().diff(moment(deadline.endDate))).asHours();
      if (hourDiff > 0 && hourDiff < 48) {
        createNotification(
          NotificationType.IncomingDeadline,
          `Deadline "${deadline.title}" will due in ${Math.round(hourDiff)} hours`
        );
      }
    });

    setInterval(() => {
      _.each(roomState.rooms, (room) => {
        _.each(JSON.parse(room.roomTimes) as RoomTimes[], (time) => {
          if (moment().format("dddd").toLowerCase() === time.dayOfWeek.toLowerCase()) {
            const minuteDiff = moment.duration(moment().diff(moment(time.startTime, "HH:mm"))).asMinutes();
            if (minuteDiff > 0 && minuteDiff <= 15) {
              createNotification(
                NotificationType.IncomingClass,
                `Room "${room.roomName}" will start in ${Math.round(minuteDiff)} minutes`
              );
            }
          }
        });
      });
    }, 5000);
  }, []);

  return (
    <HashRouter>
      <Switch>
        <Route exact path="/" component={LoginForm} />
        <Route exact path="/homepage" component={HomePage} />
        <Route exact path="/register" component={RegisterForm} />
        <Route exact path="/googleUpdateInfo" component={GoogleUpdateInfoForm} />
        <Route exact path="/chatRoom/:roomId" component={ChatArea} />
        <Route exact path="/resetPassword" component={ResetPasswordComponent} />
        <Route exact path="/profile" component={ProfilePage} />
        <Route exact path="/room/:roomId/:creatorId/:roomName/:groupId?" component={RoomComponent} />
      </Switch>
    </HashRouter>
  );
});
