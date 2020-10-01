import * as React from "react";
import { useState } from "react";
import { Sidebar, SidebarItem, Avatar, AvatarMenu, MenuItem } from "react-rainbow-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faCalendarAlt, faComment, faPencilAlt, faPowerOff, faCog } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import logo from "./logo.png";
import { signOut } from "../account-management/signout/signOut";
import { useDispatch } from "react-redux";
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
`;

const Logo = styled.img`
  margin-bottom: 100px;
  @media (max-height: 800px) {
    display: none;
  }
`;
const SideNavigationBar = () => {
  const [selectedItem, setSelectedItem] = useState("Homepage");
  const dispatch = useDispatch();
  return (
    <StyledSidebar selectedItem={selectedItem} onSelect={(_, selectedItem) => setSelectedItem(selectedItem)}>
      <SidebarItemContainer>
        <Logo src={logo} alt="logo "></Logo>
        <StyledSidebarItem icon={<StyledIcon icon={faHome} size="2x" />} name="Homepage" label="Homepage" />
        <StyledSidebarItem icon={<StyledIcon icon={faCalendarAlt} size="2x" />} name="Timetable" label="Timetable" />
        <StyledSidebarItem icon={<StyledIcon icon={faComment} size="2x" />} name="Chat" label="Chat" />
        <StyledSidebarItem icon={<StyledIcon icon={faPencilAlt} size="2x" />} name="Other" label="Other" />
        <StyledSidebarItem icon={<StyledIcon icon={faCog} size="2x" />} name="Settings" label="Settings" />
      </SidebarItemContainer>

      <StyledAvatarMenu
        assistiveText="Minh Ho"
        initials="MH"
        title="Minh Ho"
        menuAlignment="bottom-left"
        avatarSize="large"
        menuSize="small"
      >
        <MenuItem label="Edit Profile" icon={<FontAwesomeIcon icon={faPencilAlt} />} iconPosition="left" />
        <MenuItem
          label="Logout"
          icon={<FontAwesomeIcon icon={faPowerOff} />}
          onClick={() => dispatch(signOut())}
          iconPosition="left"
        />
      </StyledAvatarMenu>
    </StyledSidebar>
  );
};
export default SideNavigationBar;
