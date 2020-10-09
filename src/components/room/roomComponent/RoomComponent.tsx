import * as React from "react";
import { useState, useEffect } from "react";
import styled from "styled-components";
import { Button, Drawer, Tab, Tabset } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import { initSocket, removeListeners, setDrawerOpen, setTabsetValue } from "./roomSlice";
import ChatArea from "../chat/ChatArea";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots, faUsers } from "@fortawesome/free-solid-svg-icons";
import JitsiMeetComponent from "../jitsiMeetComponent/JitsiMeetComponent";
import UserListComponent from "../userList/UserListComponent";
import { fetchAllMessages } from "../chat/chatSlice";
import { setUserInfoList, UserInfo } from "../userList/userListSlice";
import { setShowUpperToolbar } from "../jitsiMeetComponent/jitsiMeetSlice";
import Whiteboard from "../whiteboard/Whiteboard";

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
const ChatButton = styled(Button)`
  border-radius: 0;
  padding-top: 10px;
  padding-bottom: 10px;
  border: 0;
  svg {
    width: 24px;
    height: 24px;
  }
  width: 10vw;
  height: 50px;
  color: white;
  transition: 0.3s;
`;
const PeopleButton = styled(Button)`
  border-radius: 0;
  padding-top: 10px;
  padding-bottom: 10px;
  border: 0;
  svg {
    width: 24px;
    height: 24px;
  }
  width: 10vw;
  border-bottom-right-radius: 10px;
  height: 50px;
  color: white;
  transition: 0.3s;
`;
const RoomComponent = (props: any) => {
  const roomState = useSelector((state: RootState) => state.roomState);
  const jitsiMeetState = useSelector((state: RootState) => state.jitisiMeetState);
  const { roomId, roomName, creatorId } = props.match.params;
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  // const {roomName, creatorId} = props.location.state;
  const dispatch = useDispatch();

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem("profile")) as UserInfo;
    dispatch(initSocket(roomId));
    dispatch(fetchAllMessages(roomId));
    dispatch(setUserInfoList([profile]));
    return removeListeners();
  }, [roomId]);

  function getTabContent() {
    switch (roomState.tabsetValue) {
      case "Chat":
        return <ChatArea roomId={roomId} />;
      case "People":
        return <UserListComponent />;
    }
  }

  useEffect(() => {
    console.log("Room ID: " + roomId);
  }, []);

  // onMouseMove={() => {
  //   dispatch(setShowUpperToolbar(true));
  //   console.log("Mouse is moving");
  //   let timeout;
  //   (() => {
  //     clearTimeout(timeout);
  //     timeout = setTimeout(() => dispatch(setShowUpperToolbar(false)), 4000);
  //   })();
  // }}
  return (
    <div>
      {jitsiMeetState.showUpperToolbar ? (
        <ButtonGroup id="button-group">
          <ChatButton
            variant="neutral"
            onClick={() => {
              dispatch(setTabsetValue("Chat"));
              dispatch(setDrawerOpen(true));
            }}
          >
            <FontAwesomeIcon icon={faCommentDots} size="2x" />
          </ChatButton>
          <PeopleButton
            variant="neutral"
            onClick={() => {
              dispatch(setTabsetValue("People"));
              dispatch(setDrawerOpen(true));
            }}
          >
            <FontAwesomeIcon icon={faUsers} size="2x" />
          </PeopleButton>
          <ChatButton variant="neutral" onClick={() => setWhiteboardOpen(!whiteboardOpen)}>
            Whiteboard
          </ChatButton>
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
        onRequestClose={() => dispatch(setDrawerOpen(false))}
      >
        {getTabContent()}
      </StyledDrawer>
      {/* <Whiteboard roomId={roomId} style={whiteboardOpen ? {visibility: "visible"} : {visibility: "hidden"}}/> */}
      {whiteboardOpen ? <Whiteboard roomId={roomId} /> : null}
      <JitsiMeetComponent roomId={roomId} roomName={roomName} creatorId={creatorId} />
    </div>
  );
};
export default RoomComponent;
