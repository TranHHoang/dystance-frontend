import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { Avatar, ButtonMenu, Card, MenuItem } from "react-rainbow-components";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { hostName } from "~utils/hostUtils";
import { getLoginData } from "~utils/tokenStorage";

const UserListContainer = styled.div`
  display: grid;
  grid-row-gap: 20px;
  border-radius: 0%;
`;
const StyledCard = styled(Card)`
  background-color: ${(props) => props.theme.rainbow.palette.background.secondary};
`;
const StyledAvatar = styled(Avatar)`
  img {
    object-fit: cover;
  }
`;
const UserListComponent = (props: any) => {
  const userListState = useSelector((state: RootState) => state.userListState);
  const { creatorId } = props;
  return (
    <UserListContainer>
      {userListState.map((user) => (
        <StyledCard
          key={user.id}
          icon={<StyledAvatar src={`${hostName}/${user.avatar}`} />}
          title={`${user.realName} (${user.userName})`}
          actions={
            user.id !== getLoginData().id ? (
              <ButtonMenu menuAlignment="right" menuSize="x-small" icon={<FontAwesomeIcon icon={faEllipsisV} />}>
                <MenuItem label="View Profile"></MenuItem>
                {getLoginData().id === creatorId ? (
                  <div>
                    <MenuItem label="Kick User Out"></MenuItem>
                    <MenuItem label="Mute"></MenuItem>
                  </div>
                ) : null}
              </ButtonMenu>
            ) : null
          }
        />
      ))}
    </UserListContainer>
  );
};
export default UserListComponent;
