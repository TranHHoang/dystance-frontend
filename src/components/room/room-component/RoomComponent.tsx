import { faBars, faChalkboard, faCommentDots, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PeopleProfilePage from "../../profile-page/people-profile/PeopleProfilePage";
import { setPeopleProfileModalOpen } from "../../profile-page/people-profile/peopleProfileSlice";
import * as React from "react";
import { useEffect, useState } from "react";
import { Button, Drawer, Modal, Tab, Tabset, TimelineMarker } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import ChatArea from "../chat/ChatArea";
import { fetchAllMessages, getUserInfo } from "../chat/chatSlice";
import JitsiMeetComponent from "../jitsi-meet-component/JitsiMeetComponent";
import UserListComponent from "../user-list/UserListComponent";
import Whiteboard from "../whiteboard/Whiteboard";
import { initSocket, removeListeners, setDrawerOpen, setTabsetValue, socket } from "./roomSlice";
import {
  kickUser,
  muteUser,
  setKickModalOpen,
  setMuteModalOpen,
  setRemoteControlOfferModalOpen,
  setRemoteControlWaitingModalOpen
} from "../user-list/user-card/userCardSlice";
import { StyledText } from "../../homepage/single-room/SingleRoom";
import { hostName } from "~utils/hostUtils";
import RemoteControl, { RemoteControlSignalType, REMOTE_CONTROL_SIGNAL } from "../remote-control/RemoteControl";
import { UserInfo } from "~utils/types";
import { createHashHistory } from "history";
import { getLoginData } from "~utils/tokenStorage";

const StyledHeader = styled.h1`
  color: rgba(178, 178, 178, 1);
  margin: 0 1.25rem;
  padding: 1.375rem 0 1.325rem;
  display: block;
  box-sizing: border-box;
  font-family: "Lato Light";
  font-weight: 300;
  font-size: 1.5rem;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  -webkit-letter-spacing: normal;
  -moz-letter-spacing: normal;
  -ms-letter-spacing: normal;
  letter-spacing: normal;
`;
const StyledDrawer = styled(Drawer)`
  width: 40%;
`;
const StyledTab = styled(Tab)`
  flex-grow: 1;
  overflow: hidden;
  button {
    width: 100%;
  }
`;
const ButtonGroup = styled.div`
  position: absolute;
  z-index: 1000;
`;
const NormalButton = styled(Button)`
  border-radius: 0;
  padding-top: 10px;
  padding-bottom: 10px;
  border: 0;
  svg {
    width: 24px;
    height: 24px;
  }
  width: 5vw;
  height: 50px;
  color: white;
  transition: 0.2s;
  opacity: 50%;
  min-width: 64px;
  :hover {
    opacity: 100%;
  }
`;
const RearButton = styled(NormalButton)`
  border-bottom-right-radius: 10px;
`;
const StyledModal = styled(Modal)`
  width: fit-content;
`;

const StyledAvatar = styled.img`
  max-width: 32px;
  max-height: 32px;
`;

const RoomComponent = (props: any) => {
  const roomState = useSelector((state: RootState) => state.roomState);
  const peopleProfileState = useSelector((state: RootState) => state.peopleProfileState);
  const jitsiMeetState = useSelector((state: RootState) => state.jitisiMeetState);
  const userCardState = useSelector((state: RootState) => state.userCardState);
  const { roomId, roomName, creatorId } = props.match.params;
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [remoteInitiatorInfo, setRemoteInitiatorInfo] = useState<UserInfo>();
  const [remoteControlAccepted, setRemoteControlAccepted] = useState(undefined);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initSocket(roomId));
    dispatch(fetchAllMessages(roomId));
    return () => {
      removeListeners();
    };
  }, []);

  function getTabContent() {
    switch (roomState.tabsetValue) {
      case "Chat":
        return <ChatArea roomId={roomId} />;
      case "People":
        return <UserListComponent creatorId={creatorId} />;
    }
  }

  useEffect(() => {
    console.log("Room ID: " + roomId);
  }, []);

  useEffect(() => {
    if (userCardState.isRemoteControlWaitingModalOpen) {
      socket.invoke(REMOTE_CONTROL_SIGNAL, RemoteControlSignalType.Offer, userCardState.userId, getLoginData().id);
    }
  }, [userCardState.isRemoteControlWaitingModalOpen]);

  socket.on(REMOTE_CONTROL_SIGNAL, async (data) => {
    const objData = JSON.parse(data);
    switch (objData.type) {
      case RemoteControlSignalType.Offer:
        setRemoteInitiatorInfo(await getUserInfo(objData.payload));
        dispatch(setRemoteControlOfferModalOpen({ userId: userCardState.userId, isModalOpen: true }));
        break;
      case RemoteControlSignalType.Accept:
        setRemoteControlAccepted(true);
        dispatch(setRemoteControlWaitingModalOpen({ userId: userCardState.userId, isModalOpen: false }));
        break;
      case RemoteControlSignalType.Reject:
        setRemoteControlAccepted(false);
        break;
    }
  });

  return (
    <div>
      {jitsiMeetState.showUpperToolbar ? (
        <ButtonGroup id="button-group">
          <NormalButton
            variant="neutral"
            onClick={() => {
              dispatch(setTabsetValue("Chat"));
              dispatch(setDrawerOpen(true));
            }}
          >
            <FontAwesomeIcon icon={faBars} size="2x" />
          </NormalButton>
          <RearButton variant="neutral" onClick={() => setWhiteboardOpen(!whiteboardOpen)}>
            <FontAwesomeIcon icon={faChalkboard} size="2x" />
          </RearButton>
        </ButtonGroup>
      ) : null}
      <StyledDrawer
        header={
          <span>
            <StyledHeader>Meeting Details</StyledHeader>
            <Tabset
              activeTabName={roomState.tabsetValue}
              onSelect={(_, selected) => dispatch(setTabsetValue(selected))}
            >
              <StyledTab label={<FontAwesomeIcon icon={faCommentDots} size="2x" />} name="Chat" />
              <StyledTab label={<FontAwesomeIcon icon={faUsers} size="2x" />} name="People" />
            </Tabset>
          </span>
        }
        isOpen={roomState.isDrawerOpen}
        onRequestClose={() => {
          //TODO: Prevent drawer from closing when clicking on a context menu item
          dispatch(setDrawerOpen(false));
          // if (peopleProfileState.userId && peopleProfileState.peopleProfileModalOpen === true) {
          // }
          // else {
          //   console.log(peopleProfileState.peopleProfileModalOpen);
          //   dispatch(setDrawerOpen(true))
          // }
        }}
      >
        {getTabContent()}
      </StyledDrawer>
      {remoteControlAccepted === true && (
        <RemoteControl remoteId={userCardState.userId} isStarted={remoteControlAccepted === true} />
      )}
      {whiteboardOpen ? <Whiteboard roomId={roomId} /> : null}
      <JitsiMeetComponent roomId={roomId} roomName={roomName} creatorId={creatorId} />
      <StyledModal
        isOpen={peopleProfileState.peopleProfileModalOpen}
        onRequestClose={() => {
          dispatch(setPeopleProfileModalOpen({ userId: null, peopleProfileModalOpen: false }));
          console.log("Modal in room component: " + peopleProfileState.peopleProfileModalOpen);
        }}
      >
        <PeopleProfilePage userId={peopleProfileState.userId} />
      </StyledModal>
      <StyledModal
        title="Confirm Mute"
        isOpen={userCardState.isMuteModalOpen}
        hideCloseButton={true}
        onRequestClose={() => dispatch(setMuteModalOpen({ userId: null, isMuteModalOpen: false }))}
        footer={
          <div className="rainbow-flex rainbow-justify_end">
            <Button
              className="rainbow-m-right_large"
              label="Cancel"
              variant="neutral"
              onClick={() => dispatch(setMuteModalOpen({ userId: null, isMuteModalOpen: false }))}
              disabled={userCardState.isLoading || userCardState.isMuteSuccess}
            />
            <Button
              label="Mute"
              variant="brand"
              type="submit"
              onClick={() => dispatch(muteUser(roomId, userCardState.userId))}
              disabled={userCardState.isLoading || userCardState.isMuteSuccess}
            />
          </div>
        }
      >
        <StyledText>
          Are you sure you want to mute this person? Only the person can unmute their microphone again.
        </StyledText>
      </StyledModal>
      <StyledModal
        title="Confirm Kick"
        isOpen={userCardState.isKickModalOpen}
        hideCloseButton={true}
        onRequestClose={() => dispatch(setKickModalOpen({ userId: null, isKickModalOpen: false }))}
        footer={
          <div className="rainbow-flex rainbow-justify_end">
            <Button
              className="rainbow-m-right_large"
              label="Cancel"
              variant="neutral"
              onClick={() => dispatch(setKickModalOpen({ userId: null, isKickModalOpen: false }))}
              disabled={userCardState.isLoading || userCardState.isKickSuccess}
            />
            <Button
              label="Kick"
              variant="brand"
              type="submit"
              onClick={() => dispatch(kickUser(roomId, userCardState.userId))}
              disabled={userCardState.isLoading || userCardState.isKickSuccess}
            />
          </div>
        }
      >
        <StyledText>Are you sure you want to kick this member out of the room?</StyledText>
      </StyledModal>

      <StyledModal
        hideCloseButton={true}
        isOpen={userCardState.isRemoteControlOfferModalOpen}
        footer={
          <div className="rainbow-flex rainbow-justify_end">
            <Button
              label="Decline"
              onClick={() => {
                socket.invoke(REMOTE_CONTROL_SIGNAL, RemoteControlSignalType.Reject, remoteInitiatorInfo.id, null);
                dispatch(setRemoteControlOfferModalOpen({ userId: null, isModalOpen: false }));
              }}
            />
            <Button
              label="Accept"
              variant="brand"
              onClick={() => {
                socket.invoke(REMOTE_CONTROL_SIGNAL, RemoteControlSignalType.Accept, remoteInitiatorInfo.id, null);
                dispatch(setRemoteControlOfferModalOpen({ userId: null, isModalOpen: false }));
              }}
            />
          </div>
        }
        onRequestClose={() => {
          socket.invoke(REMOTE_CONTROL_SIGNAL, RemoteControlSignalType.Reject, remoteInitiatorInfo.id, null);
          dispatch(setRemoteControlOfferModalOpen({ userId: null, isModalOpen: false }));
        }}
      >
        <TimelineMarker
          label={<b>{remoteInitiatorInfo?.userName}</b>}
          icon={<StyledAvatar src={`${hostName}/${remoteInitiatorInfo?.avatar}`} />}
          description="is trying to sneak into your computer"
        />
      </StyledModal>

      <StyledModal
        isOpen={userCardState.isRemoteControlWaitingModalOpen}
        onRequestClose={() => {
          dispatch(setRemoteControlWaitingModalOpen({ userId: userCardState.userId, isModalOpen: false }));
          setRemoteControlAccepted(undefined);
        }}
      >
        {remoteControlAccepted === undefined && <div>Waiting for connection</div>}
        {remoteControlAccepted === false && <div style={{ color: "#FE4849" }}>Your request is declined</div>}
      </StyledModal>
    </div>
  );
};
export default RoomComponent;
