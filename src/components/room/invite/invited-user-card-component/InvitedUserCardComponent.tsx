import React from "react";
import { Card, Button } from "react-rainbow-components";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { getLoginData } from "~utils/tokenStorage";
import { setKickModalOpen } from "./invitedUserCardSlice";

const StyledCard = styled(Card)`
  border-radius: 0;
  margin: 0;
  border: 0;
  box-shadow: none;
  :hover {
    filter: brightness(120%);
  }
`;
const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
`;
const TitleText = styled.h3`
  font-size: 1.15rem;
  font-weight: 500;
`;
const StyledEmailText = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.rainbow.palette.text.label};
`;

const InvitedUserCardComponent = (props: any) => {
  const { userId, icon, title, roomId, email } = props;
  const dispatch = useDispatch();

  return (
    <StyledCard
      icon={icon}
      title={
        <TitleContainer>
          <TitleText>{title}</TitleText>
          <StyledEmailText>{email}</StyledEmailText>
        </TitleContainer>
      }
      actions={
        userId !== getLoginData().id ? (
          <Button
            style={{ marginTop: "5px" }}
            label="Kick"
            onClick={() => dispatch(setKickModalOpen({ roomId, userId, isKickConfirmModalOpen: true }))}
          />
        ) : null
      }
    />
  );
};
export default InvitedUserCardComponent;
