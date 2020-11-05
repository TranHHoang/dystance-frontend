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
import { BreakoutGroup, resetRoomState, switchToGroup, removeListeners } from "../room-component/roomSlice";
import { Spinner } from "react-rainbow-components";
import { withRouter } from "react-router-dom";
import moment from "moment";
import { Logger, LogType } from "~utils/logger";
import fs from "fs";
import moment from "moment";

const loader = styled.div`
  display: none;
`;
const StyledSpinner = styled(Spinner)`
  position: absolute;
  top: 50vh;
  left: 50vw;
`;
const StyledClock = styled.div`
  position: absolute;
  background-color: #36393f;
  color: rgba(78, 204, 163, 1);
  font-size: 18px;
  padding: 8px;
  border-bottom-right-radius: 10px;
  opacity: 50%;
`;

const JitsiMeetComponent = (props: any) => {
  const userCardState = useSelector((state: RootState) => state.userCardState);
  const roomState = useSelector((state: RootState) => state.roomState);
  const profile = JSON.parse(localStorage.getItem("profile")) as User;
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [remainingTime, setRemainingTime] = useState("00:00");
  const { roomId, roomName, groupId, creatorId, history } = props;
  const api = useRef(null);
  const groupRef = useRef<BreakoutGroup>();
  const intervalRef = useRef<number>();
  const logger = Logger.getInstance();

  useEffect(() => {
    if (userCardState.muteOtherUser) {
      api?.current?.isAudioMuted().then((response: any) => {
        if (!response) {
          logger.log(LogType.Mute, roomId, `got muted`);
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
      logger.log(LogType.Kick, roomId, `got kicked`);
      api?.current?.executeCommand("hangup");
      dispatch(setKickOtherUser(false));
    }
  }, [userCardState.kickOtherUser]);

  useEffect(() => {
    if (roomState.group) {
      api.current?.executeCommand("hangup");
      groupRef.current = roomState.group;

      clearInterval(intervalRef.current);
      let duration = moment(groupRef.current.endTime).diff(moment());

      intervalRef.current = setInterval(() => {
        duration = duration - 1000;
        setRemainingTime(moment(duration).format("mm:ss"));
        if (duration <= 0) {
          clearInterval(intervalRef.current);
          api.current?.executeCommand("hangup");
        }
      }, 1000);
    }
  }, [roomState.group]);

  useEffect(() => {
    if (roomState.groupStopped && groupRef.current && groupId) {
      clearInterval(intervalRef.current);
      api.current?.executeCommand("hangup");
    }
  }, [roomState.groupStopped]);

  function redirect() {
    if (groupRef.current) {
      if (groupId) {
        // Redirect back to room
        history.push("/temp");
        history.replace(`${groupRef.current.roomPath}`);
        groupRef.current = undefined;
      } else {
        // Redirect to group
        history.push("/temp");
        history.replace(`/room/${groupRef.current.id}/${creatorId}/${groupRef.current.name}/${groupId}`);
        dispatch(switchToGroup(undefined));
      }
    } else {
      history.replace("/homepage");
      groupRef.current = undefined;
    }
  }

  function saveFile() {
    const folderName = `./logs/${getLoginData().id}`;
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName, { recursive: true });
    }
    fs.writeFile(`${folderName}/${moment().format("YYYY-MM-DD")}.txt`, logger.getLogs().join("\n"), (err) => {
      console.log("WRite to file");
      if (err) {
        console.log(err);
      }
    });
  }
  const handleAPI = (jitsiMeetAPI: any) => {
    let interval: number;
    setIsLoading(false);
    api.current = jitsiMeetAPI;
    jitsiMeetAPI.executeCommand("displayName", `${profile.realName} (${profile.userName})`);
    jitsiMeetAPI.executeCommand("avatarUrl", `${hostName}/${profile.avatar}`);
    jitsiMeetAPI.executeCommand("email", `${profile.email}`);
    jitsiMeetAPI.executeCommand("subject", `${roomName}`);
    setupScreenSharingRender(jitsiMeetAPI);

    jitsiMeetAPI.addEventListener("videoConferenceJoined", () => {
      dispatch(setShowUpperToolbar(true));
      interval = setInterval(() => {
        saveFile();
      }, 5000 * 60);
      logger.log(LogType.AttendanceJoin, roomId, `joined room`);
    });
    jitsiMeetAPI.on("readyToClose", () => {
      socket.invoke(RoomAction, roomId, RoomActionType.Leave, getLoginData().id);
      logger.log(LogType.AttendanceLeave, roomId, `left room`);
      dispatch(setShowUpperToolbar(false));
      dispatch(setRemoteControlAccepted(undefined));
      dispatch(resetRoomState());
      dispatch(resetCardState());
      removeListeners();
      redirect();
      saveFile();
      clearInterval(interval);
      jitsiMeetAPI.dispose();
    });
  };
  return (
    <>
      {isLoading && <StyledSpinner />}
      {groupRef.current && <StyledClock>{`${roomName} - ${remainingTime}`}</StyledClock>}
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
          prejoinPageEnabled: groupId === undefined,
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
