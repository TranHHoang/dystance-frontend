import { faArrowLeft, faPaperclip } from "@fortawesome/free-solid-svg-icons";
import ChatArea from "../chat/ChatArea";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { ButtonIcon, TimelineMarker } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { hostName } from "~utils/hostUtils";
import { getUserInfo, PrivateMessage, UserInfo } from "~utils/types";
import { ChatType, fetchAllMessages } from "../../components/chat/chatSlice";
import { fetchAllPreview, initSocket } from "./chatPreviewSlice";
import { getLoginData } from "~utils/tokenStorage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { socket } from "~app/App";

const StyledAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const StyledPreview = styled.div`
  padding: 20px;
  :hover {
    background-color: rgba(255, 255, 255, 0.05);
    cursor: pointer;
  }
`;

const StyledHeader = styled.header`
  position: absolute;
  z-index: 1;
  top: 2vh;
  left: 1%;

  button {
    background: rgba(70, 183, 146, 0.7);
    width: 32px;
    height: 32px;
  }
`;

const ChatPreview = () => {
  const [usersInfo, setUsersInfo] = useState<{ [key: string]: UserInfo }>({});
  const previews = useSelector((root: RootState) => root.chatPreviewState);
  const [selectedUserId, setSelectedUserId] = useState<string>();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllPreview(getLoginData().id));
  }, []);

  useEffect(() => {
    const fetchUsersInfo = async () => {
      const userDict: { [key: string]: UserInfo } = {};
      const usersInfoPromise = previews.map(async (chat) => {
        if (chat.senderId !== getLoginData().id) {
          const info = await getUserInfo(chat.senderId);
          userDict[chat.senderId] = info; // { 1: { avatar: "", }}
        } else {
          const info = await getUserInfo(chat.receiverId);
          userDict[chat.receiverId] = info; // { 1: { avatar: "", }}
        }
      });
      await Promise.all(usersInfoPromise);
      setUsersInfo(userDict);
    };
    fetchUsersInfo();
  }, [previews]);

  useEffect(() => {
    if (selectedUserId) {
      dispatch(initSocket());
      dispatch(fetchAllMessages(undefined, { id1: selectedUserId, id2: getLoginData().id }));
    }

    return () => {
      socket.off(PrivateMessage);
    };
  }, [selectedUserId]);

  return !selectedUserId ? (
    <div>
      {previews.map((preview) => {
        const id = preview.senderId !== getLoginData().id ? preview.senderId : preview.receiverId;
        return (
          <StyledPreview key={preview.id} onClick={() => setSelectedUserId(id)}>
            <TimelineMarker
              label={
                <b>
                  {usersInfo[id]?.realName} ({usersInfo[id]?.userName})
                </b>
              }
              icon={
                <StyledAvatar src={usersInfo[id]?.avatar ? `${hostName}/${usersInfo[id]?.avatar}` : ""} alt="avatar" />
              }
              datetime={moment(preview.date).calendar()}
              description={
                <>
                  <span>{preview.senderId === getLoginData().id && "You: "}</span>
                  {(preview.type === ChatType.File || preview.type === ChatType.Image) && (
                    <span>
                      <FontAwesomeIcon icon={faPaperclip} />
                      &nbsp;
                      {preview.fileName}
                    </span>
                  )}
                  {preview.type === ChatType.Text && <span> {preview.content} </span>}
                </>
              }
            />
          </StyledPreview>
        );
      })}
    </div>
  ) : (
    <div>
      <StyledHeader>
        <ButtonIcon
          icon={<FontAwesomeIcon icon={faArrowLeft} size="10x" />}
          onClick={() => setSelectedUserId(undefined)}
        />
      </StyledHeader>
      <div style={{ margin: "5px" }}>
        <ChatArea receiverId={selectedUserId} />
      </div>
    </div>
  );
};

export default ChatPreview;
