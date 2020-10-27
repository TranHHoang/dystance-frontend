import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import * as React from "react";
import { useRef } from "react";
import { Button, ButtonMenu, MenuItem, Modal } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import { hostName } from "~utils/hostUtils";
import { getLoginData } from "~utils/tokenStorage";
import { Room } from "~utils/types";
import InviteForm from "../../room/invite/InviteForm";
import { setInviteModalOpen } from "../../room/invite/inviteSlice";
import { deleteRoom, resetState, setConfirmDeleteModalOpen, setUpdateModalOpen } from "./singleRoomSlice";
import SingleRoomUpdateForm from "./SingleRoomUpdateForm";
import {
  Description,
  FlexRowContainer,
  ImageContainer,
  JoinRoomButtonContainer,
  Separator,
  StyledButton,
  StyledButtonMenu,
  StyledCard,
  StyledImage,
  StyledLink,
  StyledText,
  TextContainer,
  Time,
  Title,
  Error,
  StyledNotifications
} from "./styles";

export const SingleRoom = (props: any) => {
  const {
    roomId,
    creatorId,
    roomName,
    startHour,
    endHour,
    startDate,
    endDate,
    image,
    description,
    repeatDays,
    repeatOccurrence
  }: Room = props;
  const dispatch = useDispatch();
  const singleRoomState = useSelector((state: RootState) => state.singleRoomState);
  const formRef = useRef(null);
  const room: Room = {
    roomId: roomId,
    creatorId: creatorId,
    roomName: roomName,
    startHour: startHour,
    endHour: endHour,
    startDate: startDate,
    endDate: endDate,
    image: image,
    description: description,
    repeatDays: repeatDays,
    repeatOccurrence: repeatOccurrence
  };
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
            <StyledImage src={`${hostName}/${image}`} alt="" />
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
          <StyledLink
            style={{ textDecoration: "none", width: "100%" }}
            to={{ pathname: `/room/${roomId}/${creatorId}/${roomName}` }}
          >
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
                  label="Update Room Info"
                  onClick={() => dispatch(setUpdateModalOpen({ roomId, isUpdateModalOpen: true }))}
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

      <Modal
        style={{ width: "fit-content" }}
        title="Update Room Info"
        isOpen={singleRoomState.roomId === roomId && singleRoomState.isUpdateModalOpen}
        hideCloseButton={true}
        footer={
          <div className="rainbow-flex rainbow-justify_end">
            <Button
              className="rainbow-m-right_large"
              label="Cancel"
              variant="neutral"
              onClick={() => {
                dispatch(resetState());
                dispatch(setUpdateModalOpen({ roomId, isUpdateModalOpen: false }));
              }}
              disabled={singleRoomState.isLoading || singleRoomState.isUpdateSuccess}
            />
            <Button
              label="Update"
              variant="brand"
              type="submit"
              onClick={() => formRef.current.handleSubmit()}
              disabled={singleRoomState.isLoading || singleRoomState.isUpdateSuccess}
            />
          </div>
        }
      >
        {singleRoomState.error && (
          <StyledNotifications
            title="An Error Occured"
            hideCloseButton={true}
            description={singleRoomState.error.message}
            icon="error"
          />
        )}
        {singleRoomState.isUpdateSuccess && (
          <StyledNotifications
            title="Classroom Updated Successfully"
            hideCloseButton={true}
            description="You will be redirected to the homepage shortly"
            icon="success"
          />
        )}
        <SingleRoomUpdateForm room={room} innerRef={formRef} />
      </Modal>
    </div>
  );
};
