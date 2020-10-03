import React, { useEffect } from "react";
import CreateRoomForm from "../room-management/create-room/CreateRoomForm";
import { AllRooms } from "./all-rooms/AllRooms";
import styled from "styled-components";
import SideNavigationBar from "../sidebar/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { showProfile } from "../profile-page/showProfileInfoSlice";
import { RootState } from "~app/rootReducer";
import ProfilePage from "../profile-page/ProfilePage";
import { setSidebarValue } from "../sidebar/sidebarSlice";
import { resetRoom } from "./showRoomsSlice";
import { User } from "~utils/types";

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
  margin-left: 130px;
`;
const Container = styled.div`
  display: flex;
  height: auto;
`;

export const HomePageDisplay = () => {
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
  }, []);

  function getCurrentSidebarValue() {
    switch (sidebarState.sidebarValue) {
      case "Homepage":
        return <HomePageDisplay />;
      case "Profile":
        return <ProfilePage />;
    }
  }
  return (
    <Container>
      <SideNavigationBar />
      {getCurrentSidebarValue()}
    </Container>
  );
};
