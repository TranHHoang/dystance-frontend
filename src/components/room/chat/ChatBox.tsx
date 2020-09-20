import { faHandPaper, faImage, faPaperclip, faSmileBeam } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "emoji-mart/css/emoji-mart.css";
import { EmojiData, EmojiEntry, Picker } from "emoji-mart";
import React, { useState } from "react";
import { Modal } from "react-rainbow-components";
import styled from "styled-components";

const StyledChatBox = styled.div`
  display: flex;
  align-items: center;
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
    /* font-family: "Noto Color Emoji"; */
    @font-face {
      font-family: "Noto Color Emoji";
      src: url(https://gitcdn.xyz/repo/googlefonts/noto-emoji/master/fonts/NotoColorEmoji.ttf);
    }
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
`;

const ChatBox = () => {
  const [toggleEmoji, setToggleEmoji] = useState(false);

  function addEmoji(emoji) {
    document.getElementById("message-box").value += emoji.native;
  }

  return (
    <>
      <StyledModal isOpen={toggleEmoji} hideCloseButton={true} onRequestClose={() => setToggleEmoji(!toggleEmoji)}>
        <Picker set="twitter" onSelect={addEmoji} theme="dark" />
      </StyledModal>
      <StyledChatBox>
        <FontAwesomeIcon icon={faImage} />
        <FontAwesomeIcon icon={faPaperclip} />
        <input id="message-box" placeholder="Message classroom" />
        <FontAwesomeIcon icon={faSmileBeam} onClick={() => setToggleEmoji(!toggleEmoji)} />
        <FontAwesomeIcon icon={faHandPaper} />
      </StyledChatBox>
    </>
  );
};

export default ChatBox;
