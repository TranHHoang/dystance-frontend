import React, { useEffect, useRef } from "react";
import { hot } from "react-hot-loader";
import LoginForm from "../components/account/login/LoginForm";
import { HomePage } from "../components/homepage/Homepage";
import { Route, Switch, HashRouter } from "react-router-dom";
import ChatArea from "../components/chat/ChatArea";
import ResetPasswordComponent from "../components/account/reset-password/ResetPasswordComponent";
import RoomComponent from "../components/room/room-component/RoomComponent";
import ProfilePage from "../components/profile-page/ProfilePage";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { showTimetableEvents } from "../components/timetable/timetableSlice";
import moment from "moment";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "./rootReducer";
import _ from "lodash";
import { hostName, createNotification, NotificationType } from "~utils/index";

export const socket = new HubConnectionBuilder().withUrl(`${hostName}/socket`).build();

export default hot(module)(function App() {
  const timetableState = useSelector((state: RootState) => state.timetableState);
  const intervalRef = useRef<number>();
  const dispatch = useDispatch();

  useEffect(() => {
    const startOfWeek = moment().startOf("week").toDate();
    const endOfWeek = moment().endOf("week").toDate();
    dispatch(showTimetableEvents(startOfWeek, endOfWeek));
  }, []);
  function checkIncomingClass() {
    _.each(timetableState.events, (event) => {
      console.log(moment().format("dddd") === moment(event?.startDate).format("dddd"));

      if (moment().format("dddd") === moment(event?.startDate).format("dddd")) {
        const minuteDiff = moment.duration(moment(event?.startDate).diff(moment())).asMinutes();
        if (minuteDiff > 0 && minuteDiff <= 15) {
          createNotification(
            NotificationType.IncomingClass,
            `Room "${event?.title}" will start in ${Math.ceil(minuteDiff)} minutes`
          );
        }
      }
    });
  }
  useEffect(() => {
    checkIncomingClass();
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      checkIncomingClass();
    }, 5000 * 60);
  }, [timetableState.events]);

  return (
    <HashRouter>
      <Switch>
        <Route exact path="/" component={LoginForm} />
        <Route exact path="/homepage" component={HomePage} />
        <Route exact path="/chatRoom/:roomId" component={ChatArea} />
        <Route exact path="/resetPassword" component={ResetPasswordComponent} />
        <Route exact path="/profile" component={ProfilePage} />
        <Route exact path="/room/:roomId/:teacherId/:roomName/:groupId?" component={RoomComponent} />
      </Switch>
    </HashRouter>
  );
});
