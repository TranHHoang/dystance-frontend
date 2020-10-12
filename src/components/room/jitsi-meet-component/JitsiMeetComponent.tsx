import { createHashHistory } from "history";
import { setupScreenSharingRender } from "jitsi-meet-electron-utils";
import React from "react";
import Jitsi from "react-jitsi";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";
import { getLoginData } from "~utils/tokenStorage";
import { User, UserInfo } from "~utils/types";
import { removeListeners, socket } from "../room-component/roomSlice";
import { setUserInfoList } from "../user-list/userListSlice";
import { setShowUpperToolbar } from "./jitsiMeetSlice";

const loader = styled.div`
  display: none;
`;
const JitsiMeetComponent = (props: any) => {
  const profile = JSON.parse(localStorage.getItem("profile")) as User;
  const dispatch = useDispatch();
  const { roomId, creatorId, roomName } = props;

  const handleAPI = (JitsiMeetAPI: any) => {
    JitsiMeetAPI.executeCommand("displayName", `${profile.realName} (${profile.userName})`);
    JitsiMeetAPI.executeCommand("avatarUrl", `${hostName}/${profile.avatar}`);
    JitsiMeetAPI.executeCommand("email", `${profile.email}`);
    JitsiMeetAPI.executeCommand("subject", `${roomName}`);

    setupScreenSharingRender(JitsiMeetAPI);
    JitsiMeetAPI.addEventListener("videoConferenceJoined", () => {
      console.log("Local User Joined");
      dispatch(setShowUpperToolbar(true));
    });
    JitsiMeetAPI.on("readyToClose", () => {
      socket.invoke("LeaveRoom", roomId, getLoginData().id);
      dispatch(setShowUpperToolbar(false));
      createHashHistory().push("/homepage");
      JitsiMeetAPI.dispose();
    });
  };
  return (
    <Jitsi
      domain="jitsidystance.southeastasia.cloudapp.azure.com"
      loadingComponent={loader}
      roomName={roomId}
      displayName={`${profile.realName} (${profile.userName})`}
      userInfo={{
        email: `${profile.email}`
      }}
      containerStyle={{ width: "100%", height: "100vh" }}
      frameStyle={{ width: "100%", height: "100%", display: "block" }}
      interfaceConfig={{
        filmStripOnly: false,
        TOOLBAR_BUTTONS: [
          "microphone",
          "camera",
          "desktop",
          "fodeviceselection",
          "hangup",
          "sharedvideo",
          "raisehand",
          "videoquality",
          "stats",
          "shortcuts",
          "tileview",
          "download",
          "help",
          "mute-everyone"
        ],
        DISABLE_FOCUS_INDICATOR: true,
        VIDEO_QUALITY_LABEL_DISABLED: true
      }}
      config={{
        disableSimulcast: false,
        requireDisplayName: false,
        enableWelcomePage: false,
        enableClosePage: true,
        remoteVideoMenu: {
          disableKick: true
        },
        disableRemoteMute: true,
        desktopSharingFrameRate: {
          min: 30,
          max: 30
        }
      }}
      onAPILoad={handleAPI}
    />
  );
};
export default JitsiMeetComponent;
