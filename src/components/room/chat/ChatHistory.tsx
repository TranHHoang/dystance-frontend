import React from "react";
import { ActivityTimeline, Card, TimelineMarker } from "react-rainbow-components";
import styled from "styled-components";

const StyledTimeline = styled(ActivityTimeline)`
  padding: 20px;
`;

const StyledCard = styled(Card)`
  max-width: 512px;
`;

const ChatHistory = () => {
  return (
    <StyledTimeline>
      <TimelineMarker label="Admin" datetime="Today, 4:31 PM" description="Something went wrong" />
      <TimelineMarker label="Admin" datetime="Today, 4:32 PM" description="Something went wrong">
        <StyledCard title="Inside Content">
          <img
            src="https://react-rainbow.io/images/illustrations/Illustration-chef.svg"
            className="rainbow-m_auto rainbow-align-content_center"
            alt="landscape with rainbows, birds and colorful balloons"
          />
        </StyledCard>
      </TimelineMarker>

      <TimelineMarker label="Admin" datetime="Today, 4:32 PM" description="Something went wrong">
        <StyledCard>
          <img
            src="https://react-rainbow.io/images/illustrations/Illustration-chef.svg"
            className="rainbow-m_auto rainbow-align-content_center"
            alt="landscape with rainbows, birds and colorful balloons"
          />
        </StyledCard>
      </TimelineMarker>
      <TimelineMarker label="Admin" datetime="Today, 4:32 PM" description="Something went wrong">
        <StyledCard title="Inside Content">
          <img
            src="https://react-rainbow.io/images/illustrations/Illustration-chef.svg"
            className="rainbow-m_auto rainbow-align-content_center"
            alt="landscape with rainbows, birds and colorful balloons"
          />
        </StyledCard>
      </TimelineMarker>
    </StyledTimeline>
  );
};

export default ChatHistory;
