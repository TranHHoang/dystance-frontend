import React from "react";
import { AccordionSection, ButtonMenu, MenuItem } from "react-rainbow-components";
import styled from "styled-components";
import { getLoginData } from "~utils/tokenStorage";
import { faEllipsisV, faClock, faComment } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { useDispatch } from "react-redux";
import { setDeadlineInfo, setDeleteModalOpen, setUpdateModalOpen } from "./deadlineCardSlice";
import { DeadlineInfo } from "~utils/types";

const InfoContainer = styled.div`
  width: fit-content;
`;

const StyleTitle = styled.h2`
  font-size: 20px;
  color: ${(props) => props.theme.rainbow.palette.brand.main};
`;

const StyledIcon = styled.span`
  width: 40px;
  height: 40px;
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
  font-size: 18px;
  color: ${(props) => props.theme.rainbow.palette.text.main};
`;
const StyledSection = styled(AccordionSection)`
  h3 {
    font-size: 1.5rem;
    font-weight: 500;
  }
`;
const DeadlineCard = (props: any) => {
  const { deadlineId, roomId, title, endDate, description, creatorId } = props;
  const dispatch = useDispatch();
  const deadline: DeadlineInfo = {
    deadlineId: deadlineId,
    roomId: roomId,
    title: title,
    endDate: endDate,
    description: description,
    creatorId: creatorId
  };
  return (
    <StyledSection label={title}>
      <div className="rainbow-flex rainbow-m-bottom_medium">
        <StyledIcon>
          <FontAwesomeIcon icon={faClock} size="2x" />
        </StyledIcon>
        <InfoContainer>
          <StyleTitle>Deadline Time</StyleTitle>
          <StyleSubTitle>{moment(endDate).format("HH:mm DD-MM-YYYY")}</StyleSubTitle>
          <StyleTitle>Remaining Time</StyleTitle>
          <StyleSubTitle>{moment("2020-10-21T18:00:00").from(moment())}</StyleSubTitle>
        </InfoContainer>
      </div>
      <div className="rainbow-flex rainbow-m-bottom_medium">
        <StyledIcon>
          <FontAwesomeIcon icon={faComment} size="2x" />
        </StyledIcon>
        <InfoContainer>
          <StyleTitle>Description</StyleTitle>
          <StyleSubTitle>{description}</StyleSubTitle>
        </InfoContainer>
      </div>
      <div className="rainbow-flex rainbow-justify_end">
        {creatorId === getLoginData().id ? (
          <ButtonMenu menuAlignment="right" icon={<FontAwesomeIcon icon={faEllipsisV} />}>
            <MenuItem
              label="Update Deadline Info"
              onClick={() => {
                dispatch(setDeadlineInfo(deadline));
                dispatch(setUpdateModalOpen(true));
              }}
            />
            <MenuItem label="Delete Deadline" onClick={() => dispatch(setDeleteModalOpen(true))} />
          </ButtonMenu>
        ) : null}
      </div>
    </StyledSection>
  );
};
export default DeadlineCard;
