import * as React from "react";
import {
  Description,
  FlexRowContainer,
  ImageContainer,
  Separator,
  StyledButton,
  StyledCard,
  StyledImage,
  TextContainer,
  Time,
  Title
} from "./SingleRoomStyles";
import moment from "moment";
import { Room } from "~utils/types";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { deleteRoom, setConfirmDeleteModalOpen } from "./singleRoomSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { ButtonMenu, MenuItem, Modal, Button } from "react-rainbow-components";
import { StyledNotification } from "../../account-management/login/styles";
import styled from "styled-components";
import { getLoginData } from "~utils/tokenStorage";
import { RootState } from "~app/rootReducer";
import InviteForm from "../../room/invite/InviteForm";
import { setInviteModalOpen } from "../../room/invite/inviteSlice";

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
const Error = styled(StyledNotification)`
  margin: 0;
`;
export const SingleRoom = (props: any) => {
  const { roomId, creatorId, roomName, startHour, endHour, image, description }: Room = props;
  const dispatch = useDispatch();
  const singleRoomState = useSelector((state: RootState) => state.singleRoomState);
  const inviteState = useSelector((state: RootState) => state.inviteState);

  function formatTime(time: string): string {
    const parts = time.split(":");
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return moment(date).format("HH:mm");
  }
  return (
    <div>
      <StyledCard
        className="rainbow-flex rainbow-flex_column
    rainbow-align_flex-start rainbow-p-vertical_small rainbow-m-around_small"
      >
        <Separator />
        <FlexRowContainer>
          <ImageContainer>
            <StyledImage
              src={
                image
                  ? image
                  : "https://image.freepik.com/free-vector/empty-classroom-interior-school-college-class_107791-631.jpg"
              }
              alt=""
            />
          </ImageContainer>
          <Time>
            {formatTime(startHour)} - {formatTime(endHour)}
          </Time>
        </FlexRowContainer>
        <TextContainer>
          <Title>{roomName}</Title>
        </TextContainer>
        <Description
          readOnly
          value={description}
          rows={3}
          className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
        />

        <JoinRoomButtonContainer>
          <StyledLink style={{ textDecoration: "none", width: "100%" }} to={{ pathname: `/voiceCamPreview/${roomId}` }}>
            <StyledButton label="Join Now" variant="brand" />
          </StyledLink>
          <StyledButtonMenu
            menuAlignment="right"
            menuSize="x-small"
            buttonVariant="base"
            icon={<FontAwesomeIcon icon={faEllipsisV} />}
          >
            {creatorId === getLoginData().id ? (
              <div>
                <MenuItem
                  label="Invite people to room"
                  onClick={() => dispatch(setInviteModalOpen({ roomId, isModalOpen: true }))}
                />
                <MenuItem
                  label="Delete Room"
                  onClick={() => dispatch(setConfirmDeleteModalOpen({ roomId, isConfirmDeleteModalOpen: true }))}
                />
              </div>
            ) : null}
          </StyledButtonMenu>
        </JoinRoomButtonContainer>
      </StyledCard>
      <InviteForm roomId={roomId} />
      <Modal
        id="delete-room-modal"
        title="Confirm Room Delete"
        isOpen={singleRoomState.roomId === roomId && singleRoomState.isConfirmDeleteModalOpen}
        hideCloseButton={true}
        footer={
          <div className="rainbow-flex rainbow-justify_end">
            <Button
              className="rainbow-m-right_large"
              label="Cancel"
              variant="neutral"
              onClick={() => dispatch(setConfirmDeleteModalOpen({ roomId, isConfirmDeleteModalOpen: false }))}
              disabled={singleRoomState.isLoading || singleRoomState.isDeleteSuccess}
            />
            <Button
              label="Delete"
              variant="brand"
              type="submit"
              onClick={() => dispatch(deleteRoom(roomId))}
              disabled={singleRoomState.isLoading || singleRoomState.isDeleteSuccess}
            />
          </div>
        }
      >
        {singleRoomState.error && <Error title={singleRoomState.error.message} hideCloseButton={true} icon="error" />}
        <StyledText>Are you sure you want to delete this room?</StyledText>
      </Modal>
    </div>
  );
};
