import ChatPreview from "../private-chat/ChatPreview";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import ProfilePage from "../profile-page/ProfilePage";
import { showProfile } from "../profile-page/showProfileInfoSlice";
import SideNavigationBar from "../sidebar/Sidebar";
import { setSidebarValue } from "../sidebar/sidebarSlice";
import { fetchAllUsers } from "./showRoomsSlice";
import { resetPrivateChatBadge } from "../private-chat/chatPreviewSlice";
import StudentTeacherManagement from "../../components/student-teacher-management/StudentTeacherManagement";
import AccountList from "../management/account/AccountList";


const Container = styled.div`
  display: flex;
  height: auto;
`;

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
        return <AccountList />;
      case "Profile":
        return <ProfilePage />;
      case "Timetable":
        return <StudentTeacherManagement />;
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
