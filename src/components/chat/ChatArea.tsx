import { faFileAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { Button, Modal, ProgressBar } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import ChatBox from "./ChatBox";
import ChatHistory from "./ChatHistory";
import { broadcastMessage, ChatType } from "./chatSlice";

const ChatHistoryArea = styled.div`
  overflow: auto;
  transform: translate3d(0, 0, 0); /* Faster scrolling */
  min-width: 450px;
`;
const StyledChatArea = styled.div`
  background-color: ${(props) => props.theme.rainbow.palette.background.secondary};
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 98vh;
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
    margin-left: 10px;
  }
  div#group {
    float: right;
  }
  svg {
    max-width: 128px;
    top: -25;
    left: 40;
    position: absolute;
  }
`;

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ChatArea = (props: any) => {
  const chatState = useSelector((root: RootState) => root.chatState);
  const [file, setFile] = useState<File>();
  const [imagePreview, setImagePreview] = useState("");
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const chatBox = useRef<HTMLDivElement>();
  const { roomId, receiverId } = props;
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

    if (e.dataTransfer.items[0]?.kind === "file") {
      const file = e.dataTransfer.items[0].getAsFile();
      setFile(file);
    }
  }

  function sendFile() {
    if (file.size < MAX_FILE_SIZE)
      dispatch(
        broadcastMessage(roomId, receiverId, file, isImageFile(file) ? ChatType.Image : ChatType.File, (percentage) => {
          setUploadPercentage(percentage);
        })
      );
  }

  useEffect(() => {
    if (uploadPercentage === 100) {
      setFile(undefined);
      setUploadPercentage(0);
    }
  }, [uploadPercentage]);

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
        hideCloseButton={true}
        isOpen={uploadPercentage !== 0 || file?.size > MAX_FILE_SIZE}
        onRequestClose={() => setFile(undefined)}
      >
        {isImageFile(file) ? (
          <img id="img-preview" src={imagePreview} alt="" />
        ) : (
          <FontAwesomeIcon icon={faFileAlt} size="8x" />
        )}
        <div>
          <span>{file?.name}</span>
          <p>{bytesToSize(file?.size)}</p>
          {file?.size > MAX_FILE_SIZE && (
            <div style={{ color: "#FE4849", fontWeight: "bold", fontSize: "16px" }}>This file is too large</div>
          )}
          {uploadPercentage !== 0 && <ProgressBar style={{ marginLeft: "0px" }} value={uploadPercentage} />}
        </div>
      </StyledModal>

      <StyledModal
        isOpen={file !== undefined && file?.size < MAX_FILE_SIZE}
        footer={
          <div id="group">
            <Button label="Cancel" onClick={() => setFile(undefined)} />
            <Button id="upload" label="Upload" variant="brand" onClick={sendFile} />
          </div>
        }
        hideCloseButton={true}
      >
        {isImageFile(file) ? (
          <img id="img-preview" src={imagePreview} alt="" />
        ) : (
          <FontAwesomeIcon icon={faFileAlt} size="8x" />
        )}
        <div>
          <span>{file?.name}</span>
          <p>{bytesToSize(file?.size)}</p>
        </div>
      </StyledModal>
      <StyledChatArea>
        <ChatHistoryArea id="chatbox" ref={chatBox}>
          <ChatHistory isPrivateChat={roomId === undefined} />
        </ChatHistoryArea>
        <ChatBox setFile={setFile} roomId={roomId} receiverId={receiverId} />
      </StyledChatArea>
    </div>
  );
};

export default ChatArea;
