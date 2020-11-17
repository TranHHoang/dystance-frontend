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
import { useDispatch } from "react-redux";
import { initPrivateChatSocket } from "../components/private-chat/chatPreviewSlice";
import { saveFile } from "../components/room/jitsi-meet-component/JitsiMeetComponent";
import { Logger } from "~utils/logger";
import fs from "fs";
import moment from "moment";
import _ from "lodash";

export const socket = new HubConnectionBuilder().withUrl(`${hostName}/socket`).build();

export default hot(module)(function App() {
  const dispatch = useDispatch();
  const logger = Logger.getInstance();
  useEffect(() => {
    if (socket && socket.state === "Disconnected") {
      console.log("Start socket...");
      socket.start().then(() => {
        console.log("Started");
        socket.invoke("ConnectionState", 0, getLoginData().id);
        dispatch(initPrivateChatSocket());
      });
    }
    if (
      logger.getLogs().length === 0 &&
      fs.existsSync(`./logs/${getLoginData().id}/${moment().format("YYYY-MM-DD")}.txt`)
    ) {
      fs.readFile(`./logs/${getLoginData().id}/${moment().format("YYYY-MM-DD")}.txt`, "utf8", (err, data) => {
        const fileData: string[] = data.split("\n");
        _.forEach(fileData, (line) => {
          logger.getLogs().push(line);
        });
      });
    }
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
