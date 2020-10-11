import { faCalendarAlt, faCog, faComment, faHome, faPencilAlt, faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { useGoogleLogout } from "react-google-login";
import { AvatarMenu, MenuItem, Sidebar, SidebarItem } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { hostName } from "~utils/hostUtils";
import config from "../account-management/login/googleConfigs.json";
import { signOut } from "../account-management/signout/signOut";
import logo from "./logo.png";
import { setSidebarValue } from "./sidebarSlice";

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
  img {
    object-fit: cover;
  }
`;

const Logo = styled.img`
  margin-bottom: 100px;
  @media (max-height: 800px) {
    display: none;
  }
`;

const SideNavigationBar = () => {
  const sidebarState = useSelector((state: RootState) => state.sidebarState);
  const showProfileState = useSelector((state: RootState) => state.showProfileState);
  const dispatch = useDispatch();

  const googleLogout = useGoogleLogout({
    clientId: config.GoogleClientId,
    onLogoutSuccess: () => console.log("Google signed out"),
    onFailure: () => console.log("Google signed out error")
  });

  return (
    <StyledSidebar
      selectedItem={sidebarState.sidebarValue}
      onSelect={(_, selectedItem) => dispatch(setSidebarValue(selectedItem))}
    >
      <SidebarItemContainer>
        <Logo src={logo} alt="logo "></Logo>
        <StyledSidebarItem icon={<StyledIcon icon={faHome} size="2x" />} name="Homepage" label="Homepage" />
        <StyledSidebarItem icon={<StyledIcon icon={faCalendarAlt} size="2x" />} name="Timetable" label="Timetable" />
        <StyledSidebarItem icon={<StyledIcon icon={faComment} size="2x" />} name="Chat" label="Chat" />
        <StyledSidebarItem icon={<StyledIcon icon={faPencilAlt} size="2x" />} name="Other" label="Other" />
        <StyledSidebarItem icon={<StyledIcon icon={faCog} size="2x" />} name="Settings" label="Settings" />
      </SidebarItemContainer>

      <StyledAvatarMenu
        assistiveText={showProfileState.user.userName}
        title={showProfileState.user.realName}
        src={`${hostName}/${showProfileState.user.avatar}`}
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
            googleLogout.signOut();
            dispatch(signOut());
          }}
          iconPosition="left"
        />
      </StyledAvatarMenu>
    </StyledSidebar>
  );
};
export default SideNavigationBar;
