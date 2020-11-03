/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { setupScreenSharingRender } from "jitsi-meet-electron-utils";
import React, { useEffect, useRef, useState } from "react";
import Jitsi from "react-jitsi";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { hostName } from "~utils/hostUtils";
import { getLoginData } from "~utils/tokenStorage";
import { RoomAction, RoomActionType, User } from "~utils/types";
import { setRemoteControlAccepted } from "../remote-control/remoteControlSlice";
import { socket } from "~app/App";
import { resetCardState, setKickOtherUser, setMuteOtherUser } from "../user-list/user-card/userCardSlice";
import { setShowUpperToolbar } from "./jitsiMeetSlice";
import { removeListeners, resetRoomState } from "../room-component/roomSlice";
import { BreakoutGroup, resetRoomState, switchToGroup } from "../room-component/roomSlice";
import { Spinner } from "react-rainbow-components";
import { withRouter } from "react-router-dom";
import moment from "moment";

const loader = styled.div`
  display: none;
`;
const StyledSpinner = styled(Spinner)`
  position: absolute;
  top: 50vh;
  left: 50vw;
`;
const JitsiMeetComponent = (props: any) => {
  const userCardState = useSelector((state: RootState) => state.userCardState);
  const roomState = useSelector((state: RootState) => state.roomState);
  const profile = JSON.parse(localStorage.getItem("profile")) as User;
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const { roomId, roomName, groupId, creatorId, history } = props;
  const api = useRef(null);
  const group = useRef<BreakoutGroup>();
  const intervalRef = useRef<number>();

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

  useEffect(() => {
    if (roomState.group) {
      api.current?.executeCommand("hangup");
      group.current = roomState.group;

      clearInterval(intervalRef.current);
      let duration = moment(group.current.endTime).diff(moment());

      intervalRef.current = setInterval(() => {
        duration = duration - 1000;
        if (duration <= 0) {
          clearInterval(intervalRef.current);
          api.current?.executeCommand("hangup");
        }
      }, 1000);
    }
  }, [roomState.group]);

  function redirect() {
    if (group.current) {
      if (groupId) {
        // Redirect back to room
        history.push("/temp");
        history.replace(`${group.current.roomPath}`);
        group.current = undefined;
      } else {
        // Redirect to group
        history.push("/temp");
        history.replace(`/room/${group.current.id}/${creatorId}/${group.current.name}/${groupId}`);
        dispatch(switchToGroup(undefined));
      }
    } else {
      history.replace("/homepage");
      group.current = undefined;
    }
  }

  const handleAPI = (jitsiMeetAPI: any) => {
    setIsLoading(false);
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
      dispatch(setRemoteControlAccepted(undefined));
      dispatch(resetRoomState());
      dispatch(resetCardState());
      removeListeners();
      redirect();
      jitsiMeetAPI.dispose();
    });
  };
  return (
    <>
      {isLoading && <StyledSpinner />}
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
          // @ts-ignore
          prejoinPageEnabled: true,
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
    </>
  );
};
export default withRouter(JitsiMeetComponent);
