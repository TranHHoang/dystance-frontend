import { faImage, faPaperclip, faSmileBeam } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { resetChatBadge } from "../room/room-component/roomSlice";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import React, { useRef, useState } from "react";
import { Modal } from "react-rainbow-components";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { broadcastMessage } from "./chatSlice";
import { resetPrivateChatBadge } from "../private-chat/chatPreviewSlice";
import { Logger, LogType } from "~utils/logger";

const StyledChatBox = styled.div`
  display: flex;
  align-items: center;
  align-self: center;
  align-content: space-around;
  background-color: rgb(90, 90, 90);
  padding: 2 5 2 5;
  border-radius: 5px;
  width: 100%;
  input {
    flex: 1;
    border: none;
    background-color: rgb(90, 90, 90);
    color: white;
    padding: 5px;
    font-size: 16px;
    margin-left: 10px;
    :focus {
      outline: none;
    }
    ::-webkit-input-placeholder {
      font-size: 16px;
    }
  }

  svg {
    font-size: 24px;
    color: white;
    margin: 10px;
    :hover {
      cursor: pointer;
      color: rgba(255, 255, 255, 0.7);
    }
  }
`;

const StyledModal = styled(Modal)`
  display: flex;
  align-items: center;
  width: unset;
  background: none;
  box-shadow: none;
`;

const ChatBox = ({
  setFile,
  roomId,
  receiverId,
  inRoom
}: {
  setFile: (file: File) => void;
  roomId: string;
  receiverId: string;
  inRoom: boolean;
}) => {
  const [toggleEmoji, setToggleEmoji] = useState(false);
  const dispatch = useDispatch();
  const imageInput = useRef<HTMLInputElement>();
  const messageInput = useRef<HTMLInputElement>();
  const fileInput = useRef<HTMLInputElement>();
  const logger = Logger.getInstance();
  function addEmoji(emoji: any) {
    messageInput.current.value += emoji.native;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    dispatch(resetChatBadge());
    dispatch(resetPrivateChatBadge());
    if (e.key === "Enter") {
      if (messageInput.current.value.trim()) {
        dispatch(broadcastMessage(roomId, receiverId, messageInput.current.value));
        messageInput.current.value = "";
        if (roomId) {
          logger.log(LogType.RoomChatText, roomId, `sent message`);
        } else if (!roomId && inRoom === true) {
          logger.logPrivateChat(LogType.PrivateChatMessage, `sent message to`, receiverId);
        }
      }
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files[0]);
  }

  return (
    <>
      <StyledModal isOpen={toggleEmoji} hideCloseButton={true} onRequestClose={() => setToggleEmoji(!toggleEmoji)}>
        <Picker set="twitter" onSelect={addEmoji} theme="dark" />
      </StyledModal>
      <StyledChatBox>
        <FontAwesomeIcon icon={faImage} onClick={() => imageInput.current.click()} />
        <FontAwesomeIcon icon={faPaperclip} onClick={() => fileInput.current.click()} />
        <input type="file" accept="image/*" hidden ref={imageInput} onChange={handleFile} />
        <input type="file" hidden ref={fileInput} onChange={handleFile} />
        <input
          ref={messageInput}
          placeholder="Enter your message"
          onKeyDown={handleKeyDown}
          onFocus={() => {
            dispatch(resetChatBadge());
            dispatch(resetPrivateChatBadge());
          }}
        />
        <FontAwesomeIcon icon={faSmileBeam} onClick={() => setToggleEmoji(!toggleEmoji)} />
      </StyledChatBox>
    </>
  );
};

export default ChatBox;
