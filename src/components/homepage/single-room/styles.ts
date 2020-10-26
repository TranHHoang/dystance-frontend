import { StyledNotification } from "../../../components/account-management/styles";
import { Button, ButtonMenu, Card, Textarea, Notification } from "react-rainbow-components";
import { Link } from "react-router-dom";
import styled from "styled-components";

export const StyledCard = styled(Card)`
  width: 350px;
  height: 420px;
`;
export const FlexRowContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
`;
export const ImageContainer = styled.div`
  width: 30%;
  margin: 5% 5% 5% 5%;
`;
export const StyledImage = styled.img`
  position: relative;
  width: 105px;
  height: 105px;
  border-radius: 50%;
  z-index: 2;
`;
export const Title = styled.h1`
  font-size: 2.5em;
  text-overflow: ellipsis;
  overflow: hidden;
  font-weight: 500;
`;
export const Time = styled.h2`
  font-size: 1.5em;
  margin: 10% 5% 0 0;
  color: ${(props) => props.theme.rainbow.palette.text.label};
`;

export const TextContainer = styled.div`
  line-height: normal;
  padding: 0 5% 0 5%;
  min-width: 0;
  white-space: nowrap;
`;

export const Description = styled(Textarea)`
  font-size: 1.5em;
  padding: 0 0 0 5%;
  color: ${(props) => props.theme.rainbow.palette.text.label};
  width: 100%;
`;

export const StyledButton = styled(Button)`
  align-self: center;
  width: 50%;
  max-width: 250px;
  margin: 10px 60px 10px 0;
`;
export const Separator = styled.hr`
  color: ${(props) => props.theme.rainbow.palette.text.label};
  background-color: ${(props) => props.theme.rainbow.palette.text.label};
  position: absolute;
  width: 100%;
  top: 12%;
  z-index: 1;
  opacity: 0.2;
`;
export const JoinRoomButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;
export const StyledButtonMenu = styled(ButtonMenu)`
  align-self: center;
`;
export const StyledLink = styled(Link)`
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;
export const StyledText = styled.p`
  font-size: 20px;
  margin-left: 12px;
`;
export const Error = styled(StyledNotification)`
  margin: 0;
`;
export const StyledNotifications = styled(Notification)`
  width: 100%;
`;
