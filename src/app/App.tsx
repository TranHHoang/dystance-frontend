import React from "react";
import { hot } from "react-hot-loader";
import LoginForm from "../components/account-management/login/LoginForm";
import GoogleUpdateInfoForm from "../components/account-management/google-update-info/GoogleUpdateInfo";
import { HomePage } from "../components/homepage/Homepage";
import { Route, Switch, HashRouter } from "react-router-dom";
import RegisterForm from "../components/account-management/register/RegisterForm";
import ChatArea from "../components/room/chat/ChatArea";
import ResetPasswordComponent from "../components/account-management/reset-password/ResetPasswordComponent";
import RoomComponent from "../components/room/room-component/RoomComponent";
import ProfilePage from "../components/profile-page/ProfilePage";
import { useDispatch } from "react-redux";
import { initSocket } from "../components/room/room-component/roomSlice";

export default hot(module)(function App() {
  useDispatch()(initSocket("1"));
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
        <Route exact path="/room/:roomId/:creatorId/:roomName" component={RoomComponent} />
      </Switch>
    </HashRouter>
  );
});
