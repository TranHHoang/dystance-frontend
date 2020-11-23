import React from "react";
import { hot } from "react-hot-loader";
import LoginForm from "../components/account/login/LoginForm";
import GoogleUpdateInfoForm from "../components/account/google-update-info/GoogleUpdateInfo";
import { HomePage } from "../components/homepage/Homepage";
import { Route, Switch, HashRouter } from "react-router-dom";
import RegisterForm from "../components/account/register/RegisterForm";
import ChatArea from "../components/chat/ChatArea";
import ResetPasswordComponent from "../components/account/reset-password/ResetPasswordComponent";
import RoomComponent from "../components/room/room-component/RoomComponent";
import ProfilePage from "../components/profile-page/ProfilePage";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { hostName } from "~utils/hostUtils";

export const socket = new HubConnectionBuilder().withUrl(`${hostName}/socket`).build();

export default hot(module)(function App() {
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
        <Route exact path="/room/:roomId/:teacherId/:roomName/:groupId?" component={RoomComponent} />
      </Switch>
    </HashRouter>
  );
});
