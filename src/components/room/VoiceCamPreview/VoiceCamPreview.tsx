import * as React from "react";
import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Button, Picklist, Option, ButtonIcon } from "react-rainbow-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faVideo, faVideoSlash, faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

export const BackgroundContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: 100%;
  width: 100%;
  overflow: auto;
`;
export const VideoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
`;
export const VideoBackground = styled.div`
  background-color: #202124;
  box-sizing: border-box;
  width: 100%;
  border-radius: 10px;
  z-index: 1;
  min-height: 250px;
  max-height: 450px;
`;
export const StyledVideo = styled.video`
  min-width: 500px;
  min-height: 250px;
  width: 100%;
  object-fit: contain;
  transform: rotateY(180deg);
  border-radius: 10px;
  z-index: 99;
`;
export const Container = styled.div`
  display: flex;
  justify-content: space-around;
  text-align: center;
  align-items: center;
  flex-direction: row;
  margin: 0 auto;
  width: 100%;
  height: 100%;
  flex-wrap: wrap;
`;
export const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: row;
  z-index: 100;
  margin-top: -80px;
`;
export const SelectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 30%;
  min-width: 400px;
`;
export const StyledPicklist = styled(Picklist)`
  margin-bottom: 15px;

  label {
    font-size: 20px;
  }
  input,
  input:focus {
    padding: 25px 1rem 25px 2.35rem;
  }
`;
export const StyledButton = styled(Button)`
  margin: 10 0 10 0;
  padding: 10px;
  font-size: 20px;
`;
export const StyledButtonIcon = styled(ButtonIcon)`
  padding: 20px;
  width: 4.5rem;
  height: 4.5rem;
  border: 1px solid white;
`;

interface Device {
  value: string;
  label: string;
}
const VoiceCamPreview = (props: any) => {
  const userVideo = useRef<HTMLMediaElement>(null);
  const userStream = useRef<MediaStream>(null);
  const [audioInputs, setAudioInputs] = useState<Device[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<Device[]>([]);
  const [videoInputs, setVideoInputs] = useState<Device[]>([]);
  const [audioInputValue, setAudioInputValue] = useState<Device>(null);
  const [audioOutputValue, setAudioOutputValue] = useState<Device>(null);
  const [videoInputValue, setVideoInputValue] = useState<Device>(null);
  const [videoState, setVideoState] = useState(true);
  const [micState, setMicState] = useState(true);
  const [videoStreamTrack, setVideoStreamTrack] = useState<MediaStreamTrack>({});
  const [audioStreamTrack, setAudioStreamTrack] = useState<MediaStreamTrack>({});
  const [domError, setDomError] = useState(false);
  const audioInputList: Device[] = [];
  const audioOutputList: Device[] = [];
  const videoInputList: Device[] = [];
  const { roomId } = props.match.params;
  /* TODO: Enable webcam input again if there is no more DOMException error where another app is using the webcam*/
  useEffect(() => {
    if (domError) {
      setVideoState(false);
    } else {
      videoStreamTrack.enabled = videoState;
    }
  }, [videoState]);

  useEffect(() => {
    audioStreamTrack.enabled = micState;
  }, [micState]);

  function gotStream(stream: MediaStream) {
    setVideoStreamTrack(stream.getVideoTracks()[0]);
    setAudioStreamTrack(stream.getAudioTracks()[0]);
    stream.getAudioTracks()[0].enabled = micState;
    stream.getVideoTracks()[0].enabled = videoState;
    console.log("GotStream is run");
    userVideo.current.srcObject = stream;
    userStream.current = stream;
  }

  function gotDevices(devices: MediaDeviceInfo[]) {
    devices.forEach((device) => {
      const deviceValue = {
        value: device.deviceId,
        label: device.label
      };
      if (device.kind === "audioinput") {
        audioInputList.push(deviceValue);
      } else if (device.kind === "audiooutput") {
        audioOutputList.push(deviceValue);
      } else if (device.kind === "videoinput") {
        videoInputList.push(deviceValue);
      } else {
        console.log("Some other kind of resource", device);
      }
    });
    setAudioInputs(audioInputList);
    setAudioOutputs(audioOutputList);
    setVideoInputs(videoInputList);
    setAudioInputValue(audioInputList[0]);
    setAudioOutputValue(audioOutputList[0]);
    setVideoInputValue(videoInputList[0]);
  }

  function getUserMedia() {
    if (userStream.current) {
      userStream.current.getTracks().forEach((track) => {
        track.stop();
      });
    }
    const constraints = {
      audio: { deviceId: audioInputValue?.value ? { exact: audioInputValue?.value } : undefined },
      video: {
        deviceId: videoInputValue?.value ? { exact: videoInputValue?.value } : undefined,
        width: { min: 640 },
        height: { min: 400 },
        aspectRatio: { ideal: 1.7777777778 }
      }
    };
    console.log("getUserMedia run");
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(gotStream)
      .catch((err) => {
        if (err instanceof DOMException) {
          setDomError(true);
          if (videoState) {
            setVideoState(false);
          }
          console.log(err);
        } else {
          setDomError(false);
        }
      });
  }

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then(gotDevices)
      .then(getUserMedia)
      .catch((err) => console.log(err));
    console.log(roomId);
  }, []);

  useEffect(() => {
    if (audioInputValue !== null && videoInputValue !== null) {
      getUserMedia();
    }
  }, [audioInputValue, videoInputValue]);

  function attachSinkId(element: HTMLMediaElement, sinkId: string) {
    if (typeof element.sinkId !== "undefined") {
      element
        .setSinkId(sinkId)
        .then(() => {
          console.log(`Success, audio output device attached: ${sinkId}`);
        })
        .catch((error: any) => {
          let errorMessage = error;
          if (error.name === "SecurityError") {
            errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
          }
          console.error(errorMessage);
          // Jump back to first output device in the list as it's the default.
          setAudioOutputValue(audioOutputList[0]);
        });
    } else {
      console.warn("Browser does not support output device selection.");
    }
  }

  function changeAudioDestination(value: string) {
    attachSinkId(userVideo.current, value);
  }
  return (
    <BackgroundContainer>
      <Container>
        <VideoContainer>
          <VideoBackground>
            <StyledVideo playsInline autoPlay ref={userVideo} />
            <ButtonGroup>
              <div className="rainbow-p-right_medium">
                <StyledButtonIcon
                  variant={micState ? "border" : "destructive"}
                  size="large"
                  onClick={() => setMicState(!micState)}
                  icon={<FontAwesomeIcon icon={micState ? faMicrophone : faMicrophoneSlash} />}
                />
              </div>
              <div className="rainbow-p-right_medium">
                <StyledButtonIcon
                  variant={videoState ? "border" : "destructive"}
                  size="large"
                  onClick={() => setVideoState(!videoState)}
                  icon={<FontAwesomeIcon icon={videoState ? faVideo : faVideoSlash} />}
                />
              </div>
            </ButtonGroup>
          </VideoBackground>
        </VideoContainer>
        <SelectionContainer>
          <StyledPicklist
            label="Audio Input Source"
            value={audioInputValue}
            onChange={(e: Device) => {
              setAudioInputValue(e);
            }}
          >
            {audioInputs.map((input) => (
              <Option key={input.value} name={input.label} value={input.value} label={input.label} />
            ))}
          </StyledPicklist>
          <StyledPicklist
            label="Audio Output Source"
            value={audioOutputValue}
            onChange={(e: Device & { name: string }) => {
              changeAudioDestination(e.name);
              setAudioOutputValue(e);
            }}
          >
            {audioOutputs.map((input) => (
              <Option key={input.value} name={input.value} label={input.label} />
            ))}
          </StyledPicklist>
          <StyledPicklist
            label="Video Source"
            value={videoInputValue}
            onChange={(e: Device) => {
              setVideoInputValue(e);
            }}
          >
            {videoInputs.map((input) => (
              <Option key={input.value} name={input.label} value={input.value} label={input.label} />
            ))}
          </StyledPicklist>
          <Link to={{ pathname: `/chatRoom/${roomId}` }} replace>
            <StyledButton variant="brand">Join the room </StyledButton>
          </Link>
        </SelectionContainer>
      </Container>
    </BackgroundContainer>
  );
};

export default VoiceCamPreview;
