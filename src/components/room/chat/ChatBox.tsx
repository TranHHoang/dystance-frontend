import { faHandPaper, faImage, faPaperclip, faSmileBeam } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import React, { useRef, useState } from "react";
import { Modal } from "react-rainbow-components";
import styled from "styled-components";
import { broadcastMessage } from "./chatSlice";
import { useDispatch } from "react-redux";

const StyledChatBox = styled.div`
  display: flex;
  align-items: center;
  align-self: center;
  align-content: space-around;
  background-color: rgb(90, 90, 90);
  padding: 2px;
  border-radius: 10px;
  margin: 10px;
  padding-left: 5px;
  padding-right: 5px;
  input {
    flex: 1;
    border: none;
    background-color: rgb(90, 90, 90);
    color: white;
    padding: 5px;
    font-size: 18px;
    margin-left: 10px;
    :focus {
      outline: none;
    }
    ::-webkit-input-placeholder {
      font-size: 18px;
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

const ChatBox = ({ setFile, roomId }: { setFile: (file: File) => void; roomId: string }) => {
  const [toggleEmoji, setToggleEmoji] = useState(false);
  const dispatch = useDispatch();
  const imageInput = useRef<HTMLInputElement>();
  const messageInput = useRef<HTMLInputElement>();
  const fileInput = useRef<HTMLInputElement>();

  function addEmoji(emoji: any) {
    messageInput.current.value += emoji.native;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (messageInput.current.value.trim()) {
        dispatch(broadcastMessage(roomId, messageInput.current.value));
        messageInput.current.value = "";
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
        <input ref={messageInput} placeholder="Message classroom" onKeyDown={handleKeyDown} />
        <FontAwesomeIcon icon={faSmileBeam} onClick={() => setToggleEmoji(!toggleEmoji)} />
        <FontAwesomeIcon icon={faHandPaper} />
      </StyledChatBox>
    </>
  );
};

export default ChatBox;
