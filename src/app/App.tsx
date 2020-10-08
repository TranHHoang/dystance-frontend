import React from "react";
import { hot } from "react-hot-loader";
import LoginForm from "../components/account-management/login/LoginForm";
import GoogleUpdateInfoForm from "../components/account-management/google-update-info/GoogleUpdateInfo";
import { HomePage } from "../components/homepage/Homepage";
import { Route, Switch, HashRouter } from "react-router-dom";
import RegisterForm from "../components/account-management/register/RegisterForm";
import VoiceCamPreview from "../components/room/VoiceCamPreview/VoiceCamPreview";
import ChatArea from "../components/room/chat/ChatArea";
import ResetPasswordComponent from "../components/account-management/reset-password/ResetPasswordComponent";
import RoomComponent from "../components/room/roomComponent/RoomComponent";
import ProfilePage from "../components/profile-page/ProfilePage";

export default hot(module)(function App() {
  return (
    <HashRouter>
      <Switch>
        <Route exact path="/" component={LoginForm} />
        <Route exact path="/homepage" component={HomePage} />
        <Route exact path="/register" component={RegisterForm} />
        <Route exact path="/googleUpdateInfo" component={GoogleUpdateInfoForm} />
        <Route exact path="/voiceCamPreview/:roomId" component={VoiceCamPreview} />
        <Route exact path="/chatRoom" component={ChatArea} />
        <Route exact path="/resetPassword" component={ResetPasswordComponent} />
        <Route exact path="/profile" component={ProfilePage} />
        <Route exact path="/room/:roomId/:creatorId/:roomName" component={RoomComponent} />
      </Switch>
    </HashRouter>
  );
});
