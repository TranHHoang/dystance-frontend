import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import moment from "moment";
import * as React from "react";
import { useRef } from "react";
import { Button, MenuItem, WeekDayPicker, Accordion, AccordionSection, Modal } from "react-rainbow-components";
import { WeekDayPickerProps } from "react-rainbow-components/components/WeekDayPicker";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import { hostName } from "~utils/hostUtils";
import { getLoginData } from "~utils/tokenStorage";
import { AllUsersInfo, Room, RoomTimes, User } from "~utils/types";
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
  Creator,
  Title,
  Error,
  StyledNotifications,
  CreatorName,
  TimeText
} from "./styles";
import { setCreatorProfileOpen } from "../../profile-page/people-profile/peopleProfileSlice";
import PeopleProfilePage from "../../profile-page/people-profile/PeopleProfilePage";

export const SingleRoom = (props: any) => {
  const {
    roomId,
    creatorId,
    roomName,
    startDate,
    endDate,
    image,
    description,
    repeatOccurrence,
    roomTimes
  }: Room = props;
  const peopleProfileState = useSelector((state: RootState) => state.peopleProfileState);
  const dispatch = useDispatch();
  const singleRoomState = useSelector((state: RootState) => state.singleRoomState);
  const formRef = useRef(null);
  const room: Room = {
    roomId: roomId,
    creatorId: creatorId,
    roomName: roomName,
    startDate: startDate,
    endDate: endDate,
    image: image,
    description: description,
    repeatOccurrence: repeatOccurrence,
    roomTimes: roomTimes
  };
  const allUsers = JSON.parse(sessionStorage.getItem(AllUsersInfo)) as User[];
  const repeatDays = _.map(JSON.parse(roomTimes) as RoomTimes[], (value) => value.dayOfWeek);
  const times = JSON.parse(roomTimes) as RoomTimes[];
  const creatorInfo = _.find(allUsers, { id: creatorId });

  function formatTime(time: string): string {
    const parts = time.split(":");
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return moment(date).format("HH:mm");
  }

  function capitalizeString(string: string) {
    return string[0].toUpperCase() + string.slice(1);
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
        </FlexRowContainer>

        <TextContainer>
          <Title>{roomName}</Title>
          <Creator>
            Created By{" "}
            <CreatorName onClick={() => dispatch(setCreatorProfileOpen({ roomId, peopleProfileModalOpen: true }))}>
              {creatorInfo?.realName}
            </CreatorName>
          </Creator>
        </TextContainer>

        <WeekDayPicker multiple label="Study Days" value={repeatDays as WeekDayPickerProps["value"]} readOnly />

        <Accordion>
          <AccordionSection label="Class Times">
            {times.map((time, i) => (
              <TimeText key={i}>
                {capitalizeString(time?.dayOfWeek)}: {formatTime(time?.startTime)} - {formatTime(time?.endTime)}
              </TimeText>
            ))}
          </AccordionSection>
        </Accordion>

        <Description readOnly value={description} rows={3} className="rainbow-p-horizontal_medium rainbow-m_auto" />

        {creatorId === getLoginData().id ? (
          <JoinRoomButtonContainer>
            <StyledLink
              style={{ textDecoration: "none" }}
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
            </StyledButtonMenu>
          </JoinRoomButtonContainer>
        ) : (
          <JoinRoomButtonContainer>
            <StyledLink
              style={{ textDecoration: "none", justifyContent: "center" }}
              to={{ pathname: `/room/${roomId}/${creatorId}/${roomName}` }}
            >
              <StyledButton style={{ margin: "10 0 10 0" }} label="Join Now" variant="brand" />
            </StyledLink>
          </JoinRoomButtonContainer>
        )}
      </StyledCard>

      {/*Room Invite Component */}
      <InviteForm roomId={roomId} />

      {/*Delete Room Modal */}
      <Modal
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

      {/*Update Room Modal */}
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

      {/*Room Creator Profile Modal */}
      <Modal
        style={{ width: "fit-content" }}
        isOpen={peopleProfileState.roomId === roomId && peopleProfileState.peopleProfileModalOpen}
        onRequestClose={() => dispatch(setCreatorProfileOpen({ roomId: null, peopleProfileModalOpen: false }))}
      >
        <PeopleProfilePage userId={creatorInfo?.id} />
      </Modal>
    </div>
  );
};
