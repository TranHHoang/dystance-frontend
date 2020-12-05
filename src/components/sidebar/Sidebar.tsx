/* eslint-disable @typescript-eslint/ban-ts-ignore */
import {
  faCalendarAlt,
  faChalkboardTeacher,
  faClipboardList,
  faPencilAlt,
  faPowerOff,
  faTasks,
  faUser
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { AvatarMenu, MenuItem, Sidebar, SidebarItem } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { signOut } from "../account/signout/signOut";
import { setSidebarValue } from "./sidebarSlice";
// @ts-ignore
import logo from "./logo.png";
import { hostName, getCurrentRole } from "~utils/index";

const StyledSidebar = styled(Sidebar)`
  background: ${(props) => props.theme.rainbow.palette.background.main};
  position: fixed;
  height: 100%;
  width: 110px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  overflow: auto;
  justify-content: flex-start;
  ::-webkit-scrollbar {
    display: none;
  }
  ul {
    height: 100%;
    margin-bottom: 10px;
  }
  @media (min-height: 860px) {
    justify-content: flex-end;
    ul {
      height: 100%;
      margin-bottom: 10px;
    }
  }
`;
const StyledSidebarItem = styled(SidebarItem)`
  span {
    color: ${(props) => props.theme.rainbow.palette.text.main};
    font-size: 16px;
  }
  button {
    height: 100px;
  }
`;
const SidebarItemContainer = styled.div`
  height: 90%;
  margin-bottom: 20px;
`;
const StyledIcon = styled(FontAwesomeIcon)`
  color: white;
`;
const StyledAvatarMenu = styled(AvatarMenu)`
  display: flex;
  justify-content: center;
  img {
    object-fit: cover;
  }
`;

const Logo = styled.img`
  margin-bottom: 10vh;
  @media (max-height: 550px) {
    display: none;
  }
`;

const SideNavigationBar = () => {
  const sidebarState = useSelector((state: RootState) => state.sidebarState);
  const showProfileUser = useSelector((state: RootState) => state.showProfileState.user);
  const role = getCurrentRole();
  const dispatch = useDispatch();

  return (
    <StyledSidebar
      selectedItem={sidebarState.sidebarValue}
      onSelect={(_, selectedItem) => dispatch(setSidebarValue(selectedItem))}
    >
      <SidebarItemContainer>
        <Logo src={logo} alt="logo "></Logo>

        {["admin", "academic management"].includes(role) && (
          <StyledSidebarItem icon={<StyledIcon icon={faUser} size="2x" />} name="Accounts" label="Accounts" />
        )}

        {role === "academic management" && (
          <StyledSidebarItem icon={<StyledIcon icon={faTasks} size="2x" />} name="Semesters" label="Semesters" />
        )}

        {["teacher", "student"].includes(role) && (
          <StyledSidebarItem icon={<StyledIcon icon={faCalendarAlt} size="2x" />} name="Timetable" label="Timetable" />
        )}

        {role === "quality assurance" && (
          <StyledSidebarItem icon={<StyledIcon icon={faChalkboardTeacher} size="2x" />} name="Rooms" label="Rooms" />
        )}
        {["teacher", "student", "quality assurance", "academic management"].includes(role) && (
          <StyledSidebarItem
            icon={<StyledIcon icon={faClipboardList} size="2x" />}
            name="Reports"
            label="Attendance Reports"
          />
        )}
      </SidebarItemContainer>

      <StyledAvatarMenu
        assistiveText={showProfileUser?.userName}
        title={showProfileUser?.realName}
        src={showProfileUser?.avatar ? `${hostName}/${showProfileUser.avatar}` : ""}
        menuAlignment="bottom-left"
        avatarSize="large"
        menuSize="small"
      >
        <MenuItem
          label="Edit Profile"
          icon={<FontAwesomeIcon icon={faPencilAlt} />}
          onClick={() => {
            dispatch(setSidebarValue("Profile"));
          }}
          iconPosition="left"
        />
        <MenuItem
          label="Logout"
          icon={<FontAwesomeIcon icon={faPowerOff} />}
          onClick={() => {
            dispatch(signOut());
          }}
          iconPosition="left"
        />
      </StyledAvatarMenu>
    </StyledSidebar>
  );
};
export default SideNavigationBar;
