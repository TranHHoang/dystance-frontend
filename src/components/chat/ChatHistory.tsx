import { faFileAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { shell } from "electron";
import moment from "moment";
import React, { useEffect, useRef } from "react";
import { Card, TimelineMarker } from "react-rainbow-components";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { ChatType, isPrivateMessage, PrivateMessage, RoomMessage } from "./chatSlice";
import { AutoSizer, CellMeasurer, CellMeasurerCache, List } from "react-virtualized";
import { getUser, hostName } from "~utils/index";

const StyledTimeline = styled.div`
  overflow: hidden;
  height: 100%;
  padding: 5px;
`;

const StyledCard = styled(Card)`
  max-width: 512px;
`;
const FileCard = styled(Card)`
  width: 80%;
  padding: 15px;
`;
const FileContainer = styled.div`
  display: flex;
  flex-direction: row;
`;
const StyledFileLink = styled.a`
  color: #00b0f4;
  font-size: 16px;
  padding: 10px 0 10px 20px;
  :hover {
    color: #00b0f4;
  }
`;

const StyledText = styled.p`
  font-size: 16px;
  word-break: break-all;
  /* color: white; */
  a {
    color: #00b0f4;
  }
  a:hover {
    color: #00b0f4;
  }
`;

const StyledAvatar = styled.img`
  max-width: 40px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const ChatHistory = ({ isPrivateChat }: { isPrivateChat: boolean }) => {
  const chatState = useSelector((root: RootState) => root.chatState);
  const listRef = useRef<List>();
  const cache = useRef<CellMeasurerCache>(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 200
    })
  );

  function openExternal(e: any) {
    e.preventDefault();
    shell.openExternal(e.target.href);
  }

  function linkify(text: string) {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    return text.replace(urlRegex, function (url: string) {
      return `<a href="${url}">${url}</a>`;
    });
  }

  const messages: Array<RoomMessage | PrivateMessage> = isPrivateChat ? chatState.privateChat : chatState.roomChat;

  useEffect(() => {
    listRef.current.scrollToRow(messages.length);
  }, [chatState]);

  function renderRow({ index, key, parent, style }: any) {
    return (
      <CellMeasurer key={key} cache={cache.current} parent={parent} columnIndex={0} rowIndex={index}>
        {({ measure }) => {
          const chat = messages[index];
          const id = isPrivateMessage(chat) ? chat.senderId : chat.userId;
          return (
            <TimelineMarker
              key={chat.id}
              label={
                <b>
                  {getUser(id)?.realName} ({getUser(id)?.userName})
                </b>
              }
              datetime={moment.utc(chat.date).local().calendar()}
              icon={<StyledAvatar src={getUser(id)?.avatar ? `${hostName}/${getUser(id)?.avatar}` : ""} alt="avatar" />}
              style={style}
              description={
                <>
                  {chat.type === ChatType.Text && (
                    <StyledText dangerouslySetInnerHTML={{ __html: linkify(chat.content) }} onClick={openExternal} />
                  )}
                  {chat.type === ChatType.Image && (
                    <StyledCard>
                      <img
                        onLoad={measure}
                        src={`${hostName}/${chat.content}`}
                        className="rainbow-m_auto rainbow-align-content_center"
                        alt="landscape with rainbows, birds and colorful balloons"
                      />
                    </StyledCard>
                  )}
                  {chat.type === ChatType.File && (
                    <FileCard>
                      <FileContainer>
                        <FontAwesomeIcon icon={faFileAlt} size="3x" />
                        <StyledFileLink href={`${hostName}/${chat.content}`} download={chat.fileName}>
                          {chat.fileName}
                        </StyledFileLink>
                      </FileContainer>
                    </FileCard>
                  )}
                </>
              }
            ></TimelineMarker>
          );
        }}
      </CellMeasurer>
    );
  }

  return (
    <StyledTimeline>
      <AutoSizer>
        {({ width, height }) => (
          <List
            ref={listRef}
            width={width}
            height={height}
            deferredMeasurementCache={cache.current}
            rowHeight={cache.current.rowHeight}
            rowRenderer={renderRow}
            rowCount={messages.length}
            overscanColumnCount={3}
            style={{ outline: "none" }}
          />
        )}
      </AutoSizer>
    </StyledTimeline>
  );
};

export default ChatHistory;
