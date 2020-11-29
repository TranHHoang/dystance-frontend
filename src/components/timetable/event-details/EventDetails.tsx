import React from "react";
import { Drawer } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { setDrawerOpen } from "./eventDetailsSlice";
import moment from "moment";
import { faClock, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TimetableEventType } from "../Timetable";
import { Button } from "react-rainbow-components";
import { Link } from "react-router-dom";

const StyledLink = styled(Link)`
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

const StyledButton = styled(Button)`
  align-self: center;
  width: 50%;
  max-width: 250px;
  margin: 10px 60px 10px 0;
`;

const StyledIcon = styled.span`
  width: 50px;
  height: 50px;
  margin-right: 15px;
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.rainbow.palette.background.secondary};
  svg {
    color: white;
  }
`;

const StyleSubTitle = styled.p`
  font-size: 20px;
  color: ${(props) => props.theme.rainbow.palette.text.main};
`;

const StyleEventTitle = styled.h1`
  font-size: 30px;
  font-weight: 500;
  color: ${(props) => props.theme.rainbow.palette.brand.main};
`;
const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 20px;
`;
const StyleTitle = styled.h2`
  font-size: 20px;
  color: ${(props) => props.theme.rainbow.palette.brand.main};
`;
const InfoContainer = styled.div`
  width: fit-content;
`;
const StyledDrawer = styled(Drawer)`
  width: 30%;
`;
const StyledJoinRoomLink = styled(StyledLink)`
  justify-content: center;
  padding-top: 20px;
`;
const StyledJoinRoomButton = styled(StyledButton)`
  padding: 5 0 5 0;
  margin: 0;
`;
const EventDetailsDrawer = () => {
  const eventDetailsState = useSelector((state: RootState) => state.eventDetailsState);
  const dispatch = useDispatch();
  return (
    <StyledDrawer
      isOpen={eventDetailsState.isDrawerOpen}
      onRequestClose={() => dispatch(setDrawerOpen(false))}
      header={
        <StyledHeader>
          <StyleEventTitle>{eventDetailsState.event?.title}</StyleEventTitle>
        </StyledHeader>
      }
      slideFrom="right"
    >
      <div className="rainbow-flex rainbow-m-bottom_medium">
        <StyledIcon>
          <FontAwesomeIcon icon={faClock} size="2x" />
        </StyledIcon>
        {eventDetailsState.event?.eventType === TimetableEventType.Schedule ? (
          <InfoContainer>
            <StyleTitle>Start Time - End Time</StyleTitle>
            <StyleSubTitle>
              {moment(eventDetailsState.event?.startDate).format("HH:mm")} -{" "}
              {moment(eventDetailsState.event?.endDate).format("HH:mm")}
            </StyleSubTitle>
          </InfoContainer>
        ) : (
          <InfoContainer>
            <StyleTitle>Due Date</StyleTitle>
            <StyleSubTitle>{moment(eventDetailsState.event?.startDate).format("HH:mm DD/MM/YYYY")}</StyleSubTitle>
          </InfoContainer>
        )}
      </div>
      <div className="rainbow-flex rainbow-m-bottom_medium">
        <StyledIcon>
          <FontAwesomeIcon icon={faUser} size="2x" />
        </StyledIcon>
        <InfoContainer>
          <StyleTitle>Teacher</StyleTitle>
          <StyleSubTitle>{eventDetailsState.teacher?.realName}</StyleSubTitle>
        </InfoContainer>
      </div>
      {eventDetailsState.event?.eventType === TimetableEventType.Schedule ? (
        <div>
          <StyledJoinRoomLink
            style={{ textDecoration: "none", width: "100%" }}
            to={{
              pathname: `/room/${eventDetailsState.event?.roomId}/${eventDetailsState.event?.teacherId}/${eventDetailsState.event?.title}`
            }}
          >
            <StyledJoinRoomButton label="Join Room" variant="brand" />
          </StyledJoinRoomLink>
        </div>
      ) : null}
    </StyledDrawer>
  );
};
export default EventDetailsDrawer;
