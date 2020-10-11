import * as React from "react";
import { useState } from "react";
import { Avatar, Card } from "react-rainbow-components";
import { useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import { hostName } from "~utils/hostUtils";
import styled from "styled-components";

const UserListContainer = styled.div`
  display: grid;
  grid-row-gap: 20px;
  border-radius: 0%;
`;
const StyledCard = styled(Card)`
  background-color: ${(props) => props.theme.rainbow.palette.background.secondary};
`;
const UserListComponent = (props: any) => {
  const userListState = useSelector((state: RootState) => state.userListState);
  return (
    <UserListContainer>
      {userListState.map((user) => (
        <StyledCard
          key={user.id}
          icon={<Avatar src={`${hostName}/${user.avatar}`} />}
          title={`${user.realName} (${user.userName})`}
        />
      ))}
    </UserListContainer>
  );
};
export default UserListComponent;