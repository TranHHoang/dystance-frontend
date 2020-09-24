import React, { useEffect, useRef, useState } from "react";
import ChatBox from "./ChatBox";
import ChatHistory from "./ChatHistory";
import styled from "styled-components";
import { Button, Modal } from "react-rainbow-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";
import { RootState } from "~app/rootReducer";
import { useDispatch, useSelector } from "react-redux";
import { broadcastMessage, ChatType } from "./chatSlice";

const ChatHistoryArea = styled.div`
  overflow: auto;
  transform: translate3d(0, 0, 0); /* Faster scrolling */
  max-height: 90vh;
  min-height: 90vh;
`;

const StyledChatArea = styled.div`
  background-color: ${(props) => props.theme.rainbow.palette.background.secondary};
  overflow: auto;
`;

const StyledModal = styled(Modal)`
  img {
    max-width: 128px;
    top: -25;
    left: 25;
    position: absolute;
    border-radius: 5px;
    box-shadow: 5px 5px #888888;
  }
  div {
    margin-left: 80px;
  }
  div span {
    font-weight: bold;
    font-size: 18px;
  }
  button#upload {
    font-size: 18px;
    margin-left: 10px;
  }
  div#group {
    float: right;
  }
`;

const ChatArea = () => {
  const chatState = useSelector((root: RootState) => root.chatState);
  // const [hasFile, setHasFile] = useState(false);
  const [file, setFile] = useState<File>();
  const [imagePreview, setImagePreview] = useState("");
  const chatBox = useRef<HTMLDivElement>();

  const dispatch = useDispatch();

  function isImageFile(file: File) {
    return file?.type.includes("image") ?? false;
  }

  function bytesToSize(bytes: number) {
    if (bytes == 0) return "0 Byte";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
  }

  useEffect(() => {
    if (isImageFile(file)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

  useEffect(() => {
    chatBox.current.scrollTop = chatBox.current.scrollHeight + 500;
  }, [chatState]);

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    // setHasFile(true);

    if (e.dataTransfer.items[0]?.kind === "file") {
      setFile(e.dataTransfer.items[0].getAsFile());
    }
  }

  function sendFile() {
    dispatch(broadcastMessage("1", file, isImageFile(file) ? ChatType.Image : ChatType.File));
    setFile(undefined);
  }

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <StyledModal
        isOpen={file !== undefined}
        footer={
          <div id="group">
            <Button label="Cancel" onClick={() => setFile(undefined)} />
            <Button id="upload" label="Upload" variant="base" onClick={sendFile} />
          </div>
        }
        hideCloseButton={true}
      >
        {isImageFile(file) ? (
          <img id="img-preview" src={imagePreview} alt="" />
        ) : (
          <FontAwesomeIcon icon={faFile} size="3x" />
        )}
        <div>
          <span>{file?.name}</span>
          <p>{bytesToSize(file?.size)}</p>
        </div>
      </StyledModal>
      <StyledChatArea>
        <ChatHistoryArea id="chatbox" ref={chatBox}>
          <ChatHistory />
        </ChatHistoryArea>
        <ChatBox setFile={setFile} />
      </StyledChatArea>
    </div>
  );
};

export default ChatArea;
