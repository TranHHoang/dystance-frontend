import moment from "moment";
import React, { useEffect } from "react";
import { ActivityTimeline, Card, TimelineMarker } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { hostName } from "~utils/hostUtils";
import { initSocket, fetchAllMessages, removeListeners, ChatType } from "./chatSlice";

const StyledTimeline = styled(ActivityTimeline)`
  padding: 20px;
`;

const StyledMessage = styled(TimelineMarker)`
  p {
    font-size: 16px;
  }
`;

const StyledCard = styled(Card)`
  max-width: 512px;
`;

const ChatHistory = () => {
  const chatState = useSelector((root: RootState) => root.chatState);
  const dispatch = useDispatch();
  const roomId = "1";

  useEffect(() => {
    dispatch(initSocket(roomId));
    dispatch(fetchAllMessages(roomId));
    return removeListeners();
  }, [dispatch]);

  return (
    <StyledTimeline>
      {chatState.map((chat) => (
        <StyledMessage
          key={chat.id}
          label={chat.userId}
          datetime={moment(chat.date).calendar()}
          description={chat.type === ChatType.Text ? chat.content : undefined}
        >
          {chat.type === ChatType.Image && (
            <StyledCard>
              <img
                src={`${hostName}/${chat.content}`}
                className="rainbow-m_auto rainbow-align-content_center"
                alt="landscape with rainbows, birds and colorful balloons"
              />
            </StyledCard>
          )}
          {chat.type === ChatType.File && (
            <a href={`${hostName}/${chat.content}`} download={chat.fileName}>
              {chat.fileName}
            </a>
          )}
        </StyledMessage>
      ))}
    </StyledTimeline>
  );
};

export default ChatHistory;
