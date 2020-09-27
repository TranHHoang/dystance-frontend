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

export const SingleRoom = (props: any) => {
  const { roomId, creatorId, roomName, startHour, endHour, image, description }: Room = props;

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
      <Link to={{ pathname: `/voiceCamPreview/${roomId}` }}>
        <StyledButton label="Join Now" variant="brand" />
      </Link>
    </StyledCard>
  );
};
