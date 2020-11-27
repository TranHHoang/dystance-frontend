import {
  faBars,
  faChalkboard,
  faCommentDots,
  faComments,
  faUsers,
  faVideoSlash,
  faCalendarTimes,
  faObjectUngroup
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PeopleProfilePage from "../../profile-page/people-profile/PeopleProfilePage";
import { setPeopleProfileModalOpen } from "../../profile-page/people-profile/peopleProfileSlice";
import React from "react";
import { useEffect, useState, useRef } from "react";
import { Button, Drawer, Modal, Tab, Tabset, Notification, BadgeOverlay } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import ChatArea from "../../chat/ChatArea";
import { fetchAllMessages } from "../../chat/chatSlice";
import { AllUsersInfo, getUserInfo, RoomAction, RoomActionType, User } from "~utils/types";
import JitsiMeetComponent from "../jitsi-meet-component/JitsiMeetComponent";
import UserListComponent from "../user-list/UserListComponent";
import Whiteboard from "../whiteboard/Whiteboard";
import { initSocket, removeListeners, resetChatBadge, setDrawerOpen, setRoomId, setTabsetValue } from "./roomSlice";
import { socket } from "~app/App";
import {
  kickUser,
  muteUser,
  setKickModalOpen,
  setMuteModalOpen,
  setRemoteControlOfferModalOpen,
  setRemoteControlWaitingModalOpen
} from "../user-list/user-card/userCardSlice";
import { StyledText } from "../../homepage/single-room/styles";
import { hostName } from "~utils/hostUtils";
import RemoteControl, { RemoteControlSignalType, REMOTE_CONTROL_SIGNAL } from "../remote-control/RemoteControl";
import { UserInfo } from "~utils/types";
import { getLoginData } from "~utils/tokenStorage";
import { setRemoteControlAccepted } from "../remote-control/remoteControlSlice";
import DeadlineListComponent, { DeadlineFormComponent } from "../deadline/DeadlineListComponent";
import { deleteDeadline, setDeleteModalOpen, setUpdateModalOpen } from "../deadline/deadline-card/deadlineCardSlice";
import ChatPreview from "../../private-chat/ChatPreview";
import { ipcRenderer } from "electron";
import { resetPrivateChatBadge, initPrivateChatSocket } from "../../private-chat/chatPreviewSlice";
import GroupComponent from "../group/GroupComponent";
import { Logger, LogType } from "~utils/logger";
import _ from "lodash";

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

const PrivateChatDrawer = styled(StyledDrawer)`
  > div {
    padding-top: 0;
  }
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
  z-index: 1;
  top: calc(50vh - 100px);
  display: flex;
  flex-direction: column;
  opacity: 40%;
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
  height: 50px;
  color: white;
  transition: 0.2s;
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
const StyledNotification = styled(Notification)`
  width: 100%;
`;
const TopButton = styled(NormalButton)`
  border-top-right-radius: 10px;
`;

const StyledAvatar = styled.img`
  max-width: 40px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;
const StyleSubTitle = styled.p`
  font-size: 18px;
  color: ${(props) => props.theme.rainbow.palette.text.main};
`;
const StyleTitle = styled.h2`
  font-size: 18px;
  color: ${(props) => props.theme.rainbow.palette.brand.main};
`;
const InfoContainer = styled.div`
  width: fit-content;
  padding-left: 10px;
`;
const StyledDiv = styled.div`
  font-size: 16px;
`;
const RemoteControlButtonDiv = styled.div`
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 1vh;
`;
const InvisibleDiv = styled.div`
  position: absolute;
  top: 93vh;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  background-color: black;
`;

const RoomComponent = (props: any) => {
  const roomState = useSelector((state: RootState) => state.roomState);
  const peopleProfileState = useSelector((state: RootState) => state.peopleProfileState);
  const jitsiMeetState = useSelector((state: RootState) => state.jitisiMeetState);
  const userCardState = useSelector((state: RootState) => state.userCardState);
  const deadlineCardState = useSelector((state: RootState) => state.deadlineCardState);
  const userListState = useSelector((state: RootState) => state.userListState);
  const chatPreviewState = useSelector((state: RootState) => state.chatPreviewState);
  const formRef = useRef(null);
  const remoteControlState = useSelector((state: RootState) => state.remoteControlState);
  const { roomId, creatorId, groupId } = props.match.params;
  let { roomName } = props.match.params;
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [remoteInitiatorInfo, setRemoteInitiatorInfo] = useState<UserInfo>();
  const [privateChatOpen, setPrivateChatOpen] = useState(false);
  const dispatch = useDispatch();
  const logger = Logger.getInstance();
  const allUsers = JSON.parse(sessionStorage.getItem(AllUsersInfo)) as User[];
  const user = _.find(allUsers, { id: userCardState.userId });
  const remoteControlUser = _.find(allUsers, { id: remoteControlState.userId });
  const creatorUser = _.find(allUsers, { id: creatorId });
  const isBreakoutGroup = groupId !== undefined;
  if (isBreakoutGroup) roomName = atob(roomName);
  console.log(roomName);

  useEffect(() => {
    dispatch(initSocket(roomId));
    dispatch(fetchAllMessages(roomId, undefined));
    dispatch(initPrivateChatSocket());
    dispatch(setRoomId(roomId));

    //Listen to the event sent from ipcMain and leave Room and remove socket
    ipcRenderer.on("app-close", () => {
      socket.invoke(RoomAction, roomId, RoomActionType.Leave, getLoginData().id);
      removeListeners();
    });
  }, []);

  //Switches components when the drawer tab value is changed
  function getTabContent() {
    switch (roomState.tabsetValue) {
      case "Chat":
        return <ChatArea roomId={roomId} />;
      case "People":
        return <UserListComponent roomId={roomId} creatorId={creatorId} />;
      case "Deadline":
        return <DeadlineListComponent roomId={roomId} creatorId={creatorId} />;
      case "Groups":
        return <GroupComponent roomId={roomId} roomName={roomName} creatorId={creatorId} />;
    }
  }

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
        dispatch(setRemoteControlAccepted(true));
        break;
      case RemoteControlSignalType.Reject:
        dispatch(setRemoteControlAccepted(false));
        break;
    }
  });
  return (
    <div>
      {jitsiMeetState.showUpperToolbar ? (
        <ButtonGroup id="button-group">
          <TopButton
            onClick={() => {
              dispatch(setTabsetValue("Chat"));
              dispatch(setDrawerOpen(true));
            }}
          >
            {roomState.chatBadge > 0 ? (
              <BadgeOverlay>
                <FontAwesomeIcon icon={faBars} size="2x" />
              </BadgeOverlay>
            ) : (
              <FontAwesomeIcon icon={faBars} size="2x" />
            )}
          </TopButton>
          <NormalButton
            variant="neutral"
            onClick={() => {
              setPrivateChatOpen(true);
              dispatch(resetPrivateChatBadge());
            }}
          >
            {chatPreviewState.privateChatBadge > 0 ? (
              <BadgeOverlay>
                <FontAwesomeIcon icon={faComments} size="2x" />
              </BadgeOverlay>
            ) : (
              <FontAwesomeIcon icon={faComments} size="2x" />
            )}
          </NormalButton>
          <RearButton variant="neutral" onClick={() => setWhiteboardOpen(!whiteboardOpen)}>
            <FontAwesomeIcon icon={faChalkboard} size="2x" />
          </RearButton>
        </ButtonGroup>
      ) : null}

      <PrivateChatDrawer
        isOpen={privateChatOpen}
        onRequestClose={() => setPrivateChatOpen(false)}
        header="Private Messages"
      >
        <ChatPreview inRoom={true} />
      </PrivateChatDrawer>
      <StyledDrawer
        header={
          <span>
            <StyledHeader>Meeting Details</StyledHeader>
            <Tabset
              activeTabName={roomState.tabsetValue}
              onSelect={(_, selected) => {
                dispatch(setTabsetValue(selected));
                if (selected === "Chat") {
                  dispatch(resetChatBadge());
                }
              }}
            >
              <StyledTab
                label={
                  roomState.chatBadge > 0 ? (
                    <BadgeOverlay className="rainbow-m-around_medium" value={roomState.chatBadge} variant="brand">
                      <FontAwesomeIcon icon={faCommentDots} size="2x" />
                    </BadgeOverlay>
                  ) : (
                    <FontAwesomeIcon icon={faCommentDots} size="2x" />
                  )
                }
                name="Chat"
              />
              <StyledTab
                label={
                  <BadgeOverlay className="rainbow-m-around_medium" value={userListState.length} variant="brand">
                    <FontAwesomeIcon icon={faUsers} size="2x" />
                  </BadgeOverlay>
                }
                name="People"
              />
              {!isBreakoutGroup && (
                <>
                  <StyledTab label={<FontAwesomeIcon icon={faCalendarTimes} size="2x" />} name="Deadline" />
                  <StyledTab label={<FontAwesomeIcon icon={faObjectUngroup} size="2x" />} name="Groups" />
                </>
              )}
            </Tabset>
          </span>
        }
        isOpen={roomState.isDrawerOpen}
        onRequestClose={() => dispatch(setDrawerOpen(false))}
      >
        {getTabContent()}
      </StyledDrawer>

      <RemoteControl remoteId={userCardState.userId} isStarted={remoteControlState.remoteControlAccepted} />
      {remoteControlState.remoteControlAccepted ? (
        <InvisibleDiv className="hidden-class">
          <RemoteControlButtonDiv className="remote-control-div">
            <Button
              variant="destructive"
              onClick={() => {
                // eslint-disable-next-line prettier/prettier
                logger.log(LogType.RemoteControlStop, roomId, `Stopped remote-controlling ${remoteControlUser.realName}`);
                dispatch(setRemoteControlAccepted(undefined));
              }}
            >
              <FontAwesomeIcon icon={faVideoSlash} className="rainbow-m-right_medium" /> Stop Connection
            </Button>
          </RemoteControlButtonDiv>
        </InvisibleDiv>
      ) : null}
      {whiteboardOpen ? <Whiteboard roomId={roomId} creatorId={creatorId} /> : null}
      <JitsiMeetComponent roomId={roomId} roomName={roomName} creatorId={creatorId} groupId={groupId} />

      <StyledModal
        isOpen={peopleProfileState.peopleProfileModalOpen}
        onRequestClose={() => dispatch(setPeopleProfileModalOpen({ userId: null, peopleProfileModalOpen: false }))}
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
              onClick={() => {
                dispatch(muteUser(roomId, userCardState.userId));
                logger.log(LogType.Mute, roomId, `Muted user ${user.realName}`);
              }}
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
              onClick={() => {
                dispatch(kickUser(roomId, userCardState.userId));
                logger.log(LogType.Kick, roomId, `Kicked user ${user.realName}`);
              }}
              disabled={userCardState.isLoading || userCardState.isKickSuccess}
            />
          </div>
        }
      >
        <StyledText>Are you sure you want to kick this member out of the room?</StyledText>
      </StyledModal>
      <Modal
        isOpen={deadlineCardState.isUpdateModalOpen}
        title="Update Deadline"
        hideCloseButton={true}
        footer={
          <div className="rainbow-flex rainbow-justify_end">
            <Button
              className="rainbow-m-right_large"
              label="Cancel"
              variant="neutral"
              onClick={() => {
                formRef?.current.resetForm();
                dispatch(setUpdateModalOpen(false));
              }}
              disabled={deadlineCardState.isLoading || deadlineCardState.isDeadlineUpdateSuccess}
            />
            <Button
              label="Update"
              variant="brand"
              type="submit"
              onClick={() => formRef.current.handleSubmit()}
              disabled={deadlineCardState.isLoading || deadlineCardState.isDeadlineUpdateSuccess}
            />
          </div>
        }
      >
        {deadlineCardState.error && deadlineCardState.error.type !== 1 ? (
          <StyledNotification
            title="An Error Occured"
            hideCloseButton={true}
            description={deadlineCardState.error.message}
            icon="error"
          />
        ) : null}
        {deadlineCardState.isDeadlineUpdateSuccess && (
          <StyledNotification
            title="Deadline Created Successfully"
            hideCloseButton={true}
            description="Your deadline will appear shortly"
            icon="success"
          />
        )}
        <DeadlineFormComponent
          innerRef={formRef}
          roomId={roomId}
          creatorId={creatorId}
          deadline={deadlineCardState.deadline}
        />
      </Modal>
      <StyledModal
        title="Confirm Delete"
        isOpen={deadlineCardState.isDeleteModalOpen}
        hideCloseButton={true}
        onRequestClose={() => dispatch(setDeleteModalOpen(false))}
        footer={
          <div className="rainbow-flex rainbow-justify_end">
            <Button
              className="rainbow-m-right_large"
              label="Cancel"
              variant="neutral"
              onClick={() => dispatch(setDeleteModalOpen(false))}
              disabled={deadlineCardState.isLoading || deadlineCardState.isDeadlineDeleteSuccess}
            />
            <Button
              label="Delete"
              variant="brand"
              type="submit"
              onClick={() =>
                dispatch(
                  deleteDeadline(deadlineCardState.deadline?.deadlineId, deadlineCardState.deadline?.title, roomId)
                )
              }
              disabled={deadlineCardState.isLoading || deadlineCardState.isDeadlineDeleteSuccess}
            />
          </div>
        }
      >
        {deadlineCardState.error ? (
          <StyledNotification
            title="An Error Occured"
            hideCloseButton={true}
            description={deadlineCardState.error.message}
            icon="error"
          />
        ) : null}
        {deadlineCardState.isDeadlineDeleteSuccess && (
          <StyledNotification title="Deadline deleted Successfully" hideCloseButton={true} icon="success" />
        )}
        <StyledText>Are you sure you want to delete this deadline?</StyledText>
      </StyledModal>

      <StyledModal
        hideCloseButton={true}
        isOpen={userCardState.isRemoteControlOfferModalOpen}
        onRequestClose={() => {
          socket.invoke(REMOTE_CONTROL_SIGNAL, RemoteControlSignalType.Reject, remoteInitiatorInfo.id, null);
          logger.log(
            LogType.RemoteControlReject,
            roomId,
            `Rejected remote control request from ${creatorUser.realName}`
          );
          dispatch(setRemoteControlOfferModalOpen({ userId: null, isModalOpen: false }));
        }}
        footer={
          <div className="rainbow-flex rainbow-justify_end">
            <Button
              label="Decline"
              onClick={() => {
                socket.invoke(REMOTE_CONTROL_SIGNAL, RemoteControlSignalType.Reject, remoteInitiatorInfo.id, null);
                logger.log(
                  LogType.RemoteControlReject,
                  roomId,
                  `Rejected remote control request from ${creatorUser.realName}`
                );
                dispatch(setRemoteControlOfferModalOpen({ userId: null, isModalOpen: false }));
              }}
            />
            <Button
              label="Accept"
              variant="brand"
              onClick={() => {
                socket.invoke(REMOTE_CONTROL_SIGNAL, RemoteControlSignalType.Accept, remoteInitiatorInfo.id, null);
                logger.log(
                  LogType.RemoteControlAccept,
                  roomId,
                  `Accepted remote control request from ${creatorUser.realName}`
                );
                dispatch(setRemoteControlOfferModalOpen({ userId: null, isModalOpen: false }));
              }}
            />
          </div>
        }
      >
        <div className="rainbow-flex rainbow-m-bottom_medium">
          <StyledAvatar src={`${hostName}/${remoteInitiatorInfo?.avatar}`} />
          <InfoContainer>
            <StyleTitle>
              {remoteInitiatorInfo?.realName} ({remoteInitiatorInfo?.userName})
            </StyleTitle>
            <StyleSubTitle>wants to gain access to your computer for a bit. Do you accept?</StyleSubTitle>
          </InfoContainer>
        </div>
      </StyledModal>

      <StyledModal
        isOpen={userCardState.isRemoteControlWaitingModalOpen}
        onRequestClose={() => {
          dispatch(setRemoteControlWaitingModalOpen({ userId: userCardState.userId, isModalOpen: false }));
          dispatch(setRemoteControlAccepted(undefined));
        }}
      >
        {remoteControlState.remoteControlAccepted === undefined && <StyledDiv>Waiting for acceptance...</StyledDiv>}
        {remoteControlState.remoteControlAccepted === true && (
          <StyledDiv style={{ color: "" }}>Accepted. Preparing...</StyledDiv>
        )}
        {remoteControlState.remoteControlAccepted === false && (
          <StyledDiv style={{ color: "#FE4849" }}>Your request is declined</StyledDiv>
        )}
      </StyledModal>
    </div>
  );
};
export default RoomComponent;
