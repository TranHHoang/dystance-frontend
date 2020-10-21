import { faBars, faChalkboard, faCommentDots, faUsers, faCalendarTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PeopleProfilePage from "../../profile-page/people-profile/PeopleProfilePage";
import { setPeopleProfileModalOpen } from "../../profile-page/people-profile/peopleProfileSlice";
import React from "react";
import { useEffect, useRef, useState } from "react";
import { Button, Drawer, Modal, Tab, Tabset } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import ChatArea from "../chat/ChatArea";
import { fetchAllMessages } from "../chat/chatSlice";
import JitsiMeetComponent from "../jitsi-meet-component/JitsiMeetComponent";
import UserListComponent from "../user-list/UserListComponent";
import Whiteboard from "../whiteboard/Whiteboard";
import { initSocket, removeListeners, setDrawerOpen, setTabsetValue } from "./roomSlice";
import { kickUser, muteUser, setKickModalOpen, setMuteModalOpen } from "../user-list/user-card/userCardSlice";
import { StyledText } from "../../homepage/single-room/SingleRoom";
import DeadlineListComponent, { DeadlineFormComponent } from "../deadline/DeadlineListComponent";
import { setDeleteModalOpen, setUpdateModalOpen } from "../deadline/deadline-card/deadlineCardSlice";

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

const RoomComponent = (props: any) => {
  const roomState = useSelector((state: RootState) => state.roomState);
  const peopleProfileState = useSelector((state: RootState) => state.peopleProfileState);
  const jitsiMeetState = useSelector((state: RootState) => state.jitisiMeetState);
  const userCardState = useSelector((state: RootState) => state.userCardState);
  const deadlineCardState = useSelector((state: RootState) => state.deadlineCardState);
  const { roomId, roomName, creatorId } = props.match.params;
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const formRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initSocket(roomId));
    dispatch(fetchAllMessages(roomId));
    return () => {
      removeListeners();
    };
  }, []);
  //Switches components when the drawer tab value is changed
  function getTabContent() {
    switch (roomState.tabsetValue) {
      case "Chat":
        return <ChatArea roomId={roomId} />;
      case "People":
        return <UserListComponent creatorId={creatorId} />;
      case "Deadline":
        return <DeadlineListComponent roomId={roomId} creatorId={creatorId} />;
    }
  }

  useEffect(() => {
    console.log("Room ID: " + roomId);
  }, []);

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
              <StyledTab label={<FontAwesomeIcon icon={faCalendarTimes} size="2x" />} name="Deadline" />
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
              label="Save"
              variant="brand"
              type="submit"
              onClick={() => formRef.current.handleSubmit()}
              disabled={deadlineCardState.isLoading || deadlineCardState.isDeadlineUpdateSuccess}
            />
          </div>
        }
      >
        {/* {deadlineListState.error && deadlineListState.error.type !== 1 ?
          <StyledNotification title="An Error Occured" hideCloseButton={true}
            description={deadlineListState.error.message}
            icon="error" />
          : null}
        {deadlineListState.isDeadlineCreationSuccess && (
          <StyledNotification
            title="Deadline Created Successfully"
            hideCloseButton={true}
            description="Your deadline will appear shortly"
            icon="success"
          />
        )} */}
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
              label="Kick"
              variant="brand"
              type="submit"
              // onClick={() =>}
              disabled={deadlineCardState.isLoading || deadlineCardState.isDeadlineDeleteSuccess}
            />
          </div>
        }
      >
        <StyledText>Are you sure you want to delete this deadline?</StyledText>
      </StyledModal>
    </div>
  );
};
export default RoomComponent;
