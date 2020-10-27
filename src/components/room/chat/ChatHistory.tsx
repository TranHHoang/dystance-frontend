import { faFileAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { shell } from "electron";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { ActivityTimeline, Card, TimelineMarker } from "react-rainbow-components";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { hostName } from "~utils/hostUtils";
import { ChatType, getUserInfo } from "./chatSlice";
import { UserInfo } from "~utils/types";

const StyledTimeline = styled(ActivityTimeline)`
  padding: 0 20 0 20;
`;

const StyledMessage = styled(TimelineMarker)`
  p {
    font-size: 16px;
    word-break: break-all;
  }
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
  color: white;
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

const ChatHistory = () => {
  const [usersInfo, setUsersInfo] = useState<{ [key: string]: UserInfo }>({});
  const chatState = useSelector((root: RootState) => root.chatState);

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

  useEffect(() => {
    const fetchUsersInfo = async () => {
      const userDict: { [key: string]: UserInfo } = {};
      const usersInfoPromise = chatState.map(async (chat) => {
        const info = await getUserInfo(chat.userId);
        userDict[chat.userId] = info; // { 1: { avatar: "", }}
      });
      await Promise.all(usersInfoPromise);
      setUsersInfo(userDict);
    };
    fetchUsersInfo();
  }, [chatState]);

  useEffect(() => {
    console.log(usersInfo);
  }, [usersInfo]);

  return (
    <StyledTimeline>
      {chatState.map((chat) => (
        <StyledMessage
          key={chat.id}
          label={
            <b>
              {usersInfo[chat.userId]?.realName} ({usersInfo[chat.userId]?.userName})
            </b>
          }
          datetime={moment(chat.date).calendar()}
          icon={<StyledAvatar src={`${hostName}/${usersInfo[chat.userId]?.avatar}`} alt="avatar" />}
        >
          {chat.type === ChatType.Text && (
            <StyledText dangerouslySetInnerHTML={{ __html: linkify(chat.content) }} onClick={openExternal} />
          )}
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
            <FileCard>
              <FileContainer>
                <FontAwesomeIcon icon={faFileAlt} size="3x" />
                <StyledFileLink href={`${hostName}/${chat.content}`} download={chat.fileName}>
                  {chat.fileName}
                </StyledFileLink>
              </FileContainer>
            </FileCard>
          )}
        </StyledMessage>
      ))}
    </StyledTimeline>
  );
};

export default ChatHistory;
