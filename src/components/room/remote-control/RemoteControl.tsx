/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { Instance } from "simple-peer";
import { getLoginData } from "~utils/tokenStorage";
import { socket } from "../room-component/roomSlice";
// @ts-ignore
import wrtc from "wrtc";
import robot from "robotjs";
import styled from "styled-components";
import { getCurrentTimeMs } from "../whiteboard/js/utils";

const StyledVideo = styled.video`
  max-width: 1366px;
  max-height: 768px;
  display: none;
`;

const REMOTE_CONTROL_SIGNAL = "RemoteControlSignal";
const MIN_TIME_DELTA = 1;

enum RemoteControlSignalType {
  Ping,
  Pong,
  Signal
}

interface RemoteControlSignal {
  type: RemoteControlSignalType;
  payload: any;
}

interface MouseClickData {
  type: "click";
  clickedButton: number;
}

interface MouseMoveData {
  type: "move";
  clientX: number;
  clientY: number;
  canvasWidth: number;
  canvasHeight: number;
}

interface MouseWheelData {
  type: "wheel";
  deltaX: number;
  deltaY: number;
}

interface MouseSignalData {
  type: "mouse";
  data: MouseClickData | MouseMoveData | MouseWheelData;
}

interface KeyboardSignalData {
  type: "keyboard";
  ctrl: boolean;
  alt: boolean;
  meta: boolean;
  shift: boolean;
  key: string;
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
        chromeMediaSource: "desktop",
        maxFrameRate: 25,
        maxWidth: screen.availWidth,
        maxHeight: screen.availHeight
      }
    }
  });

  return createPeer(remoteId, false, stream);
}

function scale(x: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number) {
  return ((x - fromLow) * (toHigh - toLow)) / (fromHigh - fromLow) + toLow;
}

function keyToRobotKey(key: string) {
  switch (key) {
    case "arrowup":
      return "up";
    case "arrowdown":
      return "down";
    case "arrowleft":
      return "left";
    case "arrowright":
      return "right";
    case " ":
      return "space";
    default:
      return key;
  }
}

let lastClickedButton: number = undefined;

function syncWithRemote(data: MouseSignalData | KeyboardSignalData) {
  if (data.type === "mouse") {
    const mouseData = data.data;

    switch (mouseData.type) {
      case "move":
        const x = scale(mouseData.clientX, 0, mouseData.canvasWidth, 0, screen.width);
        const y = scale(mouseData.clientY, 0, mouseData.canvasHeight, 0, screen.height);

        if (lastClickedButton) {
          // dragging now
          robot.dragMouse(x, y);
        } else {
          robot.moveMouse(x, y);
        }
        break;
      case "click":
        if (mouseData.clickedButton) {
          robot.mouseToggle(
            "down",
            mouseData.clickedButton === 0 ? "left" : mouseData.clickedButton === 1 ? "middle" : "right"
          );
          lastClickedButton = mouseData.clickedButton;
        } else {
          if (lastClickedButton) {
            robot.mouseToggle("up", lastClickedButton === 0 ? "left" : lastClickedButton === 1 ? "middle" : "right");
          }
          lastClickedButton = undefined;
        }
        break;
      case "wheel":
        robot.scrollMouse(mouseData.deltaX, mouseData.deltaY);
        break;
    }
  } else {
    const modifiers: string[] = [];

    if (data.alt) modifiers.push("alt");
    if (data.ctrl) modifiers.push("control");
    if (data.meta) modifiers.push("command");
    if (data.shift) modifiers.push("shift");

    robot.keyTap(keyToRobotKey(data.key), modifiers);
  }
}

// let lastSendTime = 0;
// function throttle(callback: () => void) {
//   const now = getCurrentTimeMs();
//   if (now - lastSendTime > MIN_TIME_DELTA) {
//     lastSendTime = now;
//     callback();
//   }
// }

const RemoteControl = (props: any) => {
  // const { remoteId } = props;
  const videoRef = useRef<HTMLVideoElement>();
  const peer = useRef<Instance>();
  const [hasPeer, setHasPeer] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const inputRef = useRef<HTMLInputElement>();

  function signalPeer(data: MouseSignalData | KeyboardSignalData) {
    peer.current?.send(JSON.stringify(data));
  }

  useEffect(() => {
    videoRef.current.onmousedown = (e) => {
      const data: MouseClickData = {
        type: "click",
        clickedButton: e.button
      };
      signalPeer({ type: "mouse", data });
    };

    videoRef.current.onmousemove = (e) => {
      const data: MouseMoveData = {
        type: "move",
        clientX: e.clientX,
        clientY: e.clientY,
        canvasWidth: videoRef.current.getBoundingClientRect().width,
        canvasHeight: videoRef.current.getBoundingClientRect().height
      };
      signalPeer({ type: "mouse", data });
    };

    videoRef.current.onmouseup = () => {
      const data: MouseClickData = {
        type: "click",
        clickedButton: undefined
      };
      signalPeer({ type: "mouse", data });
    };

    videoRef.current.ondrag = (e) => e.preventDefault();

    videoRef.current.onwheel = (e) => {
      const data: MouseWheelData = {
        type: "wheel",
        deltaX: e.deltaX,
        deltaY: e.deltaY
      };
      signalPeer({ type: "mouse", data });
    };

    videoRef.current.onkeydown = (e) => {
      const data: KeyboardSignalData = {
        type: "keyboard",
        alt: e.altKey,
        ctrl: e.ctrlKey,
        key: e.key.toLowerCase(),
        meta: e.metaKey,
        shift: e.shiftKey
      };
      signalPeer(data);
    };

    videoRef.current.style.cursor = "none";

    socket.on(REMOTE_CONTROL_SIGNAL, async (data) => {
      const objData = JSON.parse(data) as RemoteControlSignal;
      console.log(data);

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
      socket.invoke(REMOTE_CONTROL_SIGNAL, RemoteControlSignalType.Ping, inputRef.current.value, getLoginData().id);
      console.log("Start connection");
    }
  }, [isStarted]);

  useEffect(() => {
    if (peer.current) {
      peer.current.on("stream", (stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.style.display = "initial";
      });

      peer.current.on("data", (data) => {
        console.log("Received", data);
        syncWithRemote(JSON.parse(data) as MouseSignalData | KeyboardSignalData);
      });
    }
  }, [hasPeer]);

  return (
    <div>
      <input type="text" ref={inputRef} />
      <button onClick={() => setIsStarted(true)}>Start</button> <StyledVideo autoPlay ref={videoRef} />
    </div>
  );
};

export default RemoteControl;