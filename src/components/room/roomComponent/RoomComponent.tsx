import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import { Button, Drawer, Tab, Tabset } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import { setDrawerOpen, setTabsetValue } from "./roomSlice";
import ChatArea from "../chat/ChatArea";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots, faUsers } from "@fortawesome/free-solid-svg-icons";

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
const RoomComponent = (props: any) => {
  const roomState = useSelector((state: RootState) => state.roomState);
  const { roomId } = props.match.params;
  const dispatch = useDispatch();

  function getTabContent() {
    switch (roomState.tabsetValue) {
      case "Chat":
        return <ChatArea roomId={roomId} />;
    }
  }
  return (
    <div>
      <Button
        variant="brand"
        onClick={() => {
          dispatch(setTabsetValue("Chat"));
          dispatch(setDrawerOpen(true));
        }}
      >
        Chat
      </Button>
      <Button
        variant="brand"
        onClick={() => {
          dispatch(setTabsetValue("People"));
          dispatch(setDrawerOpen(true));
        }}
      >
        People
      </Button>
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
    </div>
  );
};
export default RoomComponent;
