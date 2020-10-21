import { createHashHistory } from "history";
import { setupScreenSharingRender } from "jitsi-meet-electron-utils";
import React, { useEffect, useRef } from "react";
import Jitsi from "react-jitsi";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { hostName } from "~utils/hostUtils";
import { getLoginData } from "~utils/tokenStorage";
import { RoomAction, RoomActionType, User } from "~utils/types";
import { socket } from "~app/App";
import { setKickOtherUser, setMuteOtherUser } from "../user-list/user-card/userCardSlice";
import { setShowUpperToolbar } from "./jitsiMeetSlice";

const loader = styled.div`
  display: none;
`;
const JitsiMeetComponent = (props: any) => {
  const userCardState = useSelector((state: RootState) => state.userCardState);
  const profile = JSON.parse(localStorage.getItem("profile")) as User;
  const dispatch = useDispatch();
  const { roomId, roomName } = props;
  const api = useRef(null);

  useEffect(() => {
    if (userCardState.muteOtherUser) {
      api?.current?.isAudioMuted().then((response: any) => {
        if (!response) {
          api?.current?.executeCommand("toggleAudio");
          dispatch(setMuteOtherUser(false));
        }
        if (response) {
          dispatch(setMuteOtherUser(false));
        }
      });
    }
  }, [userCardState.muteOtherUser]);
  useEffect(() => {
    if (userCardState.kickOtherUser) {
      api?.current?.executeCommand("hangup");
      dispatch(setKickOtherUser(false));
    }
  }, [userCardState.kickOtherUser]);

  const handleAPI = (jitsiMeetAPI: any) => {
    api.current = jitsiMeetAPI;
    jitsiMeetAPI.executeCommand("displayName", `${profile.realName} (${profile.userName})`);
    jitsiMeetAPI.executeCommand("avatarUrl", `${hostName}/${profile.avatar}`);
    jitsiMeetAPI.executeCommand("email", `${profile.email}`);
    jitsiMeetAPI.executeCommand("subject", `${roomName}`);
    setupScreenSharingRender(jitsiMeetAPI);

    jitsiMeetAPI.addEventListener("videoConferenceJoined", () => {
      dispatch(setShowUpperToolbar(true));
    });
    jitsiMeetAPI.on("readyToClose", () => {
      socket.invoke(RoomAction, roomId, RoomActionType.Leave, getLoginData().id);
      dispatch(setShowUpperToolbar(false));
      createHashHistory().push("/homepage");
      jitsiMeetAPI.dispose();
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
