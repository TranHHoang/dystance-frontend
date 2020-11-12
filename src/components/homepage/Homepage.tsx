import Timetable from "../timetable/Timetable";
import ChatPreview from "../private-chat/ChatPreview";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import ProfilePage from "../profile-page/ProfilePage";
import { showProfile } from "../profile-page/showProfileInfoSlice";
import CreateRoomForm from "../room-management/create-room/CreateRoomForm";
import SideNavigationBar from "../sidebar/Sidebar";
import { setSidebarValue } from "../sidebar/sidebarSlice";
import { AllRooms } from "./all-rooms/AllRooms";
import { fetchAllUsers } from "./showRoomsSlice";
import { initPrivateChatSocket, resetPrivateChatBadge } from "../private-chat/chatPreviewSlice";
import { socket } from "~app/App";
import { getLoginData } from "~utils/tokenStorage";

const CreateRoomDiv = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 0 20px 20px;
`;
const AllRoomsDiv = styled.div`
  display: flex;
`;
const Title = styled.h1`
  font-size: 2.5em;
  font-weight: 500;
  color: white;
  padding-right: 20px;
`;

const HomePageContainer = styled.div`
  display: flex;
  flex-direction: column;
`;
const Container = styled.div`
  display: flex;
  height: auto;
`;

const HomePageDisplay = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (socket && socket.state === "Disconnected") {
      console.log("Start socket...");
      socket.start().then(() => {
        console.log("Started");
        socket.invoke("ConnectionState", 0, getLoginData().id);
        dispatch(initPrivateChatSocket());
      });
    }
  }, []);

  return (
    <HomePageContainer>
      <CreateRoomDiv>
        <Title>All Rooms</Title>
        <CreateRoomForm />
      </CreateRoomDiv>
      <AllRoomsDiv>
        <AllRooms />
      </AllRoomsDiv>
    </HomePageContainer>
  );
};

export const HomePage = () => {
  const sidebarState = useSelector((state: RootState) => state.sidebarState);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setSidebarValue("Homepage"));
    dispatch(showProfile());
    dispatch(fetchAllUsers());
  }, []);

  function getCurrentSidebarValue() {
    switch (sidebarState.sidebarValue) {
      case "Homepage":
        return <HomePageDisplay />;
      case "Profile":
        return <ProfilePage />;
      case "Timetable":
        return <Timetable />;
      case "Chat":
        dispatch(resetPrivateChatBadge());
        return <ChatPreview />;
    }
  }
  return (
    <Container>
      <SideNavigationBar />
      <div style={{ marginLeft: "110px", width: "100%" }}>{getCurrentSidebarValue()}</div>
    </Container>
  );
};
