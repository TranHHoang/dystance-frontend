import { faBars, faChalkboard, faCommentDots, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { useEffect, useState } from "react";
import { Button, Drawer, Tab, Tabset } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { UserInfo } from "~utils/types";
import ChatArea from "../chat/ChatArea";
import { fetchAllMessages } from "../chat/chatSlice";
import JitsiMeetComponent from "../jitsi-meet-component/JitsiMeetComponent";
import UserListComponent from "../user-list/UserListComponent";
import { setUserInfoList } from "../user-list/userListSlice";
import Whiteboard from "../whiteboard/Whiteboard";
import { initSocket, removeListeners, setDrawerOpen, setTabsetValue } from "./roomSlice";

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
const RoomComponent = (props: any) => {
  const roomState = useSelector((state: RootState) => state.roomState);
  const jitsiMeetState = useSelector((state: RootState) => state.jitisiMeetState);
  const { roomId, roomName, creatorId } = props.match.params;
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
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
        onRequestClose={() => dispatch(setDrawerOpen(false))}
      >
        {getTabContent()}
      </StyledDrawer>
      {whiteboardOpen ? <Whiteboard roomId={roomId} /> : null}
      <JitsiMeetComponent roomId={roomId} roomName={roomName} creatorId={creatorId} />
    </div>
  );
};
export default RoomComponent;
