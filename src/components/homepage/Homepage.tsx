import ChatPreview from "../private-chat/ChatPreview";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import ProfilePage from "../profile-page/ProfilePage";
import { showProfile } from "../profile-page/showProfileInfoSlice";
import SideNavigationBar from "../sidebar/Sidebar";
import { setSidebarValue } from "../sidebar/sidebarSlice";
import { fetchAllUsers } from "./showRoomsSlice";
import { initPrivateChatSocket, resetPrivateChatBadge } from "../private-chat/chatPreviewSlice";
import SemesterManagement from "../management/semester/SemesterManagement";
import RoomList from "../../components/activity-logs/room-list/RoomList";
import fs from "fs";
import moment from "moment";
import { getLoginData } from "~utils/tokenStorage";
import { Logger } from "~utils/logger";
import _ from "lodash";
import StudentTeacherManagement from "../management/StudentTeacherManagement";
import AccountList from "../management/account/AccountList";
import { AllUsersInfo, getCurrentRole } from "~utils/types";
import { Spinner } from "react-rainbow-components";
import { socket } from "~app/App";
import Timetable from "../../components/timetable/Timetable";
import StudentAttendanceReport from "../attendance-reports/student-report/StudentAttendanceReport";
import AttendanceManagement from "../attendance-reports/student-report/AttendanceManagement";

const StyledSpinner = styled(Spinner)`
  position: absolute;
  top: 50vh;
  left: 50vw;
`;

const Container = styled.div`
  display: flex;
  height: auto;
`;

function getDefaultPage() {
  switch (getCurrentRole()) {
    case "admin":
      return "Accounts";
    case "academic management":
      return "Accounts";
    case "quality assurance":
      return "Rooms";
    case "student":
    case "teacher":
      return "Timetable";
  }
}

export const HomePage = () => {
  const sidebarState = useSelector((state: RootState) => state.sidebarState);
  const logger = Logger.getInstance();
  const dispatch = useDispatch();
  const [ready, setReady] = useState(AllUsersInfo in sessionStorage);

  useEffect(() => {
    fetchAllUsers().then(() => setReady(true));
    if (socket && socket.state === "Disconnected") {
      console.log("Start socket...");
      socket.start().then(() => {
        console.log("Started");
        socket.invoke("ConnectionState", 0, getLoginData().id);
        dispatch(initPrivateChatSocket());
      });
    }
    dispatch(setSidebarValue("Homepage"));
    dispatch(showProfile());
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

  useEffect(() => {
    if (ready) {
      dispatch(setSidebarValue(getDefaultPage()));
      dispatch(showProfile());
    }
  }, [ready]);

  function getCurrentSidebarValue() {
    switch (sidebarState.sidebarValue) {
      case "Accounts":
        if (getCurrentRole() === "admin") return <AccountList />;
        else if (getCurrentRole() === "academic management") return <StudentTeacherManagement />;
      case "Semesters":
        return <SemesterManagement />;
      case "Profile":
        return <ProfilePage />;
      case "Timetable":
        return <AttendanceManagement />;
      case "Chat":
        dispatch(resetPrivateChatBadge());
        return <ChatPreview />;
      case "Rooms":
        return <RoomList />;
      case "Reports":
        return <div />;
    }
  }
  return (
    <Container>
      <SideNavigationBar />
      {!ready && <StyledSpinner />}
      {ready && <div style={{ marginLeft: "110px", width: "100%" }}>{getCurrentSidebarValue()}</div>}
    </Container>
  );
};
