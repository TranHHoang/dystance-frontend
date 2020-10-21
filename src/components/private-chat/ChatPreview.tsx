import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import ChatArea from "../chat/ChatArea";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { ButtonIcon, TimelineMarker } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { hostName } from "~utils/hostUtils";
import { getUserInfo, UserInfo } from "~utils/types";
import { fetchAllMessages } from "../../components/chat/chatSlice";
import { initSocket } from "./chatPreviewSlice";
import { getLoginData } from "~utils/tokenStorage";

const StyledAvatar = styled.img`
  width: 32px;
  height: 32px;
`;

const StyledPreview = styled.div``;

const PreviewChat = () => {
  const [usersInfo, setUsersInfo] = useState<{ [key: string]: UserInfo }>({});
  const previews = useSelector((root: RootState) => root.chatPreviewState);
  const [selectedUserId, setSelectedUserId] = useState<string>();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUsersInfo = async () => {
      const userDict: { [key: string]: UserInfo } = {};
      const usersInfoPromise = previews.map(async (chat) => {
        const info = await getUserInfo(chat.userId);
        userDict[chat.userId] = info; // { 1: { avatar: "", }}
      });
      await Promise.all(usersInfoPromise);
      setUsersInfo(userDict);
    };
    fetchUsersInfo();
  }, [previews]);

  useEffect(() => {
    if (selectedUserId) {
      dispatch(initSocket(getLoginData().id));
      dispatch(fetchAllMessages(undefined, selectedUserId));
    }
  }, [selectedUserId]);

  return !selectedUserId ? (
    <div className="rainbow-m-around_xx-large">
      {previews.map((preview) => (
        <StyledPreview key={preview.userId} onClick={() => console.log(preview.userId)}>
          <TimelineMarker
            label={
              <b>
                {usersInfo[preview.userId]?.realName} ({usersInfo[preview.userId]?.userName})
              </b>
            }
            icon={<StyledAvatar src={`${hostName}/${usersInfo[preview.userId]?.avatar}`} alt="avatar" />}
            datetime={moment(preview.lastDate).calendar()}
            description={preview.lastChat}
          />
        </StyledPreview>
      ))}
    </div>
  ) : (
    <div>
      <header className="rainbow-align-content_space-between rainbow-p-vertical_small rainbow-align-content_space-between rainbow-p-vertical_small">
        <ButtonIcon icon={faArrowLeft} onClick={() => setSelectedUserId(undefined)} />
      </header>
      <ChatArea receiverId={selectedUserId} />
    </div>
  );
};

export default PreviewChat;
