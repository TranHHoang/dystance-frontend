import React, { useEffect, useState } from "react";
import ChatBox from "./ChatBox";
import ChatHistory from "./ChatHistory";
import styled from "styled-components";
import { Button, Modal } from "react-rainbow-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";

const ChatHistoryArea = styled.div`
  overflow: auto;
  transform: translate3d(0, 0, 0); /* Faster scrolling */
  max-height: 90vh;
`;

const StyledChatArea = styled.div`
  background-color: ${(props) => props.theme.rainbow.palette.background.secondary};
  /* overflow: auto; */
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
  const [hasFile, setHasFile] = useState(false);
  const [file, setFile] = useState(null as File);
  const [imagePreview, setImagePreview] = useState("");

  function isImageFile(file: File) {
    return /(jpg|png|jpeg)$/.test(file?.name);
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

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setHasFile(true);

    if (e.dataTransfer.items[0]?.kind === "file") {
      setFile(e.dataTransfer.items[0].getAsFile());
    }
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
        isOpen={hasFile}
        footer={
          <div id="group">
            <Button onClick={() => setHasFile(false)}>Cancel</Button>
            <Button id="upload" variant="base">
              Upload
            </Button>
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
        <ChatHistoryArea>
          <ChatHistory />
        </ChatHistoryArea>
        <ChatBox />
      </StyledChatArea>
    </div>
  );
};

export default ChatArea;
