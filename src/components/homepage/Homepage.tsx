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
import { resetPrivateChatBadge } from "../private-chat/chatPreviewSlice";
import RoomList from "../../components/activity-logs/room-list/RoomList";
import fs from "fs";
import moment from "moment";
import { getLoginData } from "~utils/tokenStorage";
import { Logger } from "~utils/logger";
import _ from "lodash";

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
  const logger = Logger.getInstance();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setSidebarValue("Homepage"));
    dispatch(showProfile());
    dispatch(fetchAllUsers());
    if (!fs.existsSync(`./logs/${getLoginData().id}/${moment().format("YYYY-MM-DD")}.txt`)) {
      fs.writeFile(
        `./logs/${getLoginData().id}/${moment().format("YYYY-MM-DD")}.txt`,
        Logger.getInstance().getLogs().join("\n"),
        (err) => {
          console.log("WRite to file");
          if (err) {
            console.log(err);
          }
        }
      );
    }
    if (
      logger.getLogs().length === 0 &&
      fs.existsSync(`./logs/${getLoginData().id}/${moment().format("YYYY-MM-DD")}.txt`)
    ) {
      fs.readFile(`./logs/${getLoginData().id}/${moment().format("YYYY-MM-DD")}.txt`, "utf8", (err, data) => {
        if (data !== "") {
          const fileData: string[] = data.split("\n");
          _.forEach(fileData, (line) => {
            logger.getLogs().push(line);
          });
        }
      });
    }
  }, []);

  function getCurrentSidebarValue() {
    switch (sidebarState.sidebarValue) {
      case "Homepage":
        return <RoomList />;
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
