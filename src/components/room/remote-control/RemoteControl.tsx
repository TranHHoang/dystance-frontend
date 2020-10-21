/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import Peer, { Instance } from "simple-peer";
import { getLoginData } from "~utils/tokenStorage";
import { socket } from "../room-component/roomSlice";
import wrtc from "wrtc";
import robot from "robotjs";
import styled from "styled-components";
import { getCurrentTimeMs } from "../whiteboard/js/utils";

const StyledVideo = styled.video`
  max-width: 1366px;
  max-height: 768px;
`;

const REMOTE_CONTROL_SIGNAL = "RemoteControlSignal";
const MIN_TIME_DELTA = 1;
// const MIN_DIST_DELTA = 1;

enum RemoteControlSignalType {
  Ping,
  Pong,
  Signal
}

interface RemoteControlSignal {
  type: RemoteControlSignalType;
  payload: any;
}

interface MouseData {
  clickedButton: number;

  clientX: number;
  clientY: number;
  canvasWidth: number;
  canvasHeight: number;
}

interface ControlSignalData {
  type: "mouse" | "keyboard";
  data: MouseData;
}

function createPeer(remoteId: string, initiator: boolean, stream?: MediaStream) {
  const peer = new SimplePeer({ initiator, stream, wrtc });

  peer.on("signal", (data) => {
    // Send my signal to remote machine
    socket.invoke(REMOTE_CONTROL_SIGNAL, RemoteControlSignalType.Signal, remoteId, JSON.stringify(data));
  });

  peer.on("connect", () => {
    console.log("Connected");
  });

  return peer;
}

async function initPeerWithDesktopCapturer(remoteId: string): Promise<Instance> {
  const stream = await (navigator.mediaDevices as any).getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop"
      }
    }
  });

  return createPeer(remoteId, false, stream);
}

function scale(x: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number) {
  return ((x - fromLow) * (toHigh - toLow)) / (fromHigh - fromLow) + toLow;
}

let lastClickedButton = 0;

function syncControlWithRemote(data: ControlSignalData) {
  if (data.type === "mouse") {
    const mouseData = data.data as MouseData;
    const x = scale(mouseData.clientX, 0, mouseData.canvasWidth, 0, robot.getScreenSize().width);
    const y = scale(mouseData.clientY, 0, mouseData.canvasHeight, 0, robot.getScreenSize().height);

    robot.moveMouse(x, y);

    if (mouseData.clickedButton !== 0) {
      robot.mouseToggle(
        "down",
        mouseData.clickedButton === 1 ? "left" : mouseData.clickedButton === 2 ? "middle" : "right"
      );
      lastClickedButton = mouseData.clickedButton;
    } else {
      robot.mouseToggle("up", lastClickedButton === 1 ? "left" : lastClickedButton === 2 ? "middle" : "right");
      // robot.mouseToggle("up");
      // robot.mouseToggle("up", "middle");
      // robot.mouseToggle("up", "right");
    }
  }
}

const RemoteControl = (props: any) => {
  // Initiator is trying to connect to remoteClient
  // const { remoteId } = props;
  const videoRef = useRef<HTMLVideoElement>();
  const peer = useRef<Instance>();
  const [hasPeer, setHasPeer] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const inputRef = useRef<HTMLInputElement>();
  const lastSendTime = useRef<number>(0);

  function getMouseData(e: MouseEvent) {
    return {
      clientX: e.clientX,
      clientY: e.clientY,
      canvasWidth: videoRef.current.getBoundingClientRect().width,
      canvasHeight: videoRef.current.getBoundingClientRect().height
    };
  }

  function handleMouseEvent(e: MouseEvent, mouseUp = false) {
    const mouseData = getMouseData(e);

    const signalData: ControlSignalData = {
      type: "mouse",
      data: {
        clickedButton: !mouseUp ? e.which : 0,
        ...mouseData
      }
    };

    const now = getCurrentTimeMs();

    if (now - lastSendTime.current > MIN_TIME_DELTA) {
      lastSendTime.current = now;

      peer.current?.send(JSON.stringify(signalData));
    }
  }

  useEffect(() => {
    videoRef.current.onmousedown = handleMouseEvent;
    videoRef.current.onmousemove = handleMouseEvent;
    videoRef.current.onmouseup = (e) => handleMouseEvent(e, true);
    videoRef.current.ondrag = (e) => e.preventDefault();
    videoRef.current.style.cursor = "none";

    socket.on(REMOTE_CONTROL_SIGNAL, async (data) => {
      const objData = JSON.parse(data) as RemoteControlSignal;
      // console.log(data)

      switch (objData.type) {
        case RemoteControlSignalType.Ping:
          // Get offer from remote
          peer.current = await initPeerWithDesktopCapturer(objData.payload);
          // Pong back
          socket.invoke(REMOTE_CONTROL_SIGNAL, RemoteControlSignalType.Pong, objData.payload, getLoginData().id);
          setHasPeer(true);
          break;
        case RemoteControlSignalType.Pong:
          peer.current = createPeer(objData.payload, true);
          setHasPeer(true);
          break;
        case RemoteControlSignalType.Signal:
          peer.current.signal(JSON.parse(objData.payload));
          break;
      }
    });

    return () => {
      socket.off(REMOTE_CONTROL_SIGNAL);
    };
  }, []);

  useEffect(() => {
    if (isStarted) {
      setTimeout(() => {
        socket.invoke(REMOTE_CONTROL_SIGNAL, RemoteControlSignalType.Ping, inputRef.current.value, getLoginData().id);
      }, 2000);
      console.log("Start connection");
    }
  }, [isStarted]);

  useEffect(() => {
    if (peer.current) {
      peer.current.on("stream", (stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.hidden = false;
      });

      peer.current.on("data", (data) => {
        console.log("Recieved", data);
        // syncControlWithRemote(JSON.parse(data) as ControlSignalData);
      });
    }
  }, [hasPeer]);

  return (
    <div>
      <input type="text" ref={inputRef} />
      <button onClick={() => setIsStarted(true)}>Start</button>
      <StyledVideo autoPlay ref={videoRef} hidden />
    </div>
  );
};

export default RemoteControl;
