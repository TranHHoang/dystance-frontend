import * as React from "react";
import { Avatar } from "react-rainbow-components";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { hostName } from "~utils/hostUtils";
import UserCardComponent from "./user-card/UserCardComponent";

const UserListContainer = styled.div`
  display: grid;
  grid-row-gap: 20px;
  border-radius: 0%;
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
        <div key={user.id}>
          <UserCardComponent
            userId={user.id}
            icon={<StyledAvatar src={`${hostName}/${user.avatar}`} />}
            title={`${user.realName} (${user.userName})`}
            creatorId={creatorId}
          />
        </div>
      ))}
    </UserListContainer>
  );
};
export default UserListComponent;
