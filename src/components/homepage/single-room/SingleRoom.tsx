import * as React from "react";
import { useState } from "react";
import { Card, Button } from "react-rainbow-components";
import styled from "styled-components";

const StyledCard = styled(Card)`
  width: 350px;
  height: 450px;
`;
const Title = styled.h1`
  font-size: 3em;
  text-overflow: ellipsis;
  overflow: hidden;
`;
const Time = styled.h2`
  font-size: 1.5em;
`;

const TextContainer = styled.div`
  line-height: normal;
  padding: 0 5% 30px 5%;
  min-width: 0;
  white-space: nowrap;
`;

const Description = styled.p`
  font-size: 1.5em;
  padding: 5% 0 5% 5%;
`;

const StyledButton = styled(Button)`
  align-self: center;
  width: 50%;
`;
export const SingleRoom = (props: any) => {
  const { id, name, startDate, startHour, endHour, endDate, image, description }: any = props;

  return (
    <StyledCard
      className="rainbow-flex rainbow-flex_column 
    rainbow-align_flex-start rainbow-p-vertical_small rainbow-m-around_small"
    >
      <TextContainer>
        <Title>{name}</Title>
        <Time>
          {startHour} - {endHour}
        </Time>
      </TextContainer>
      <img src={image} alt="" />
      <Description>{description}</Description>
      <StyledButton label="Join Now" variant="brand" />
    </StyledCard>
  );
};
