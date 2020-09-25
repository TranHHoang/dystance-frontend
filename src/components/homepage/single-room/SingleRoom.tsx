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

export const SingleRoom = (props: any) => {
  const { name, startHour, endHour, image, description }: any = props;

  return (
    <StyledCard
      className="rainbow-flex rainbow-flex_column 
    rainbow-align_flex-start rainbow-p-vertical_small rainbow-m-around_small"
    >
      <Separator />
      <FlexRowContainer>
        <ImageContainer>
          <StyledImage src="https://www.w3schools.com/howto/img_avatar.png" alt="" />
        </ImageContainer>
        <Time>
          {startHour} - {endHour}
        </Time>
      </FlexRowContainer>
      <TextContainer>
        <Title>{name}</Title>
      </TextContainer>
      <Description
        readOnly
        value={description}
        rows={3}
        className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
      />
      <StyledButton label="Join Now" variant="brand" />
    </StyledCard>
  );
};
