/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { Instance } from "simple-peer";
import { getLoginData } from "~utils/tokenStorage";
import { socket } from "~app/App";
// @ts-ignore
import wrtc from "wrtc";
import robot from "robotjs";
import styled from "styled-components";
import { setRemoteControlWaitingModalOpen } from "../user-list/user-card/userCardSlice";
import { useDispatch } from "react-redux";
import { createNotification, NotificationType } from "~utils/notification";

const StyledVideo = styled.video`
  width: 100%;
  height: 93vh;
  display: none;
  position: absolute;
  background-color: black;
`;

export const REMOTE_CONTROL_SIGNAL = "RemoteControlSignal";

export enum RemoteControlSignalType {
  Offer,
  Accept,
  Reject,
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
  const peer = new SimplePeer({ initiator, stream, wrtc, trickle: false });

  peer.on("signal", (data) => {
    // Send my signal to remote machine
    socket.invoke(REMOTE_CONTROL_SIGNAL, RemoteControlSignalType.Signal, remoteId, JSON.stringify(data));
  });

  peer.on("connect", () => {
    console.log("Connected");
  });

  peer.on("close", () => {
    createNotification(NotificationType.RoomNotification, "Remote control session has stopped");
    console.log("Destroyed");
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
    case "meta":
      return "command";
    default:
      return key;
  }
}

let lastClickedButton: number = undefined;

function syncWithRemote(data: MouseSignalData | KeyboardSignalData) {
  if (data.type === "mouse") {
    const mouseData = data.data;
    const screenSize = robot.getScreenSize();

    switch (mouseData.type) {
      case "move":
        const x = scale(mouseData.clientX, 0, mouseData.canvasWidth, 0, screenSize.width);
        const y = scale(mouseData.clientY, 0, mouseData.canvasHeight, 0, screenSize.height);

        robot.moveMouse(x, y);
        break;
      case "click":
        if (mouseData.clickedButton !== undefined) {
          robot.mouseToggle(
            "down",
            mouseData.clickedButton === 0 ? "left" : mouseData.clickedButton === 1 ? "middle" : "right"
          );
          lastClickedButton = mouseData.clickedButton;
        } else {
          if (lastClickedButton !== undefined) {
            robot.mouseToggle("up", lastClickedButton === 0 ? "left" : lastClickedButton === 1 ? "middle" : "right");
          }
          lastClickedButton = undefined;
        }
        break;
      case "wheel":
        robot.scrollMouse(mouseData.deltaX, -mouseData.deltaY);
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

const RemoteControl = (props: any) => {
  const { remoteId, isStarted } = props;
  const videoRef = useRef<HTMLVideoElement>();
  const peer = useRef<Instance>();
  const [hasPeer, setHasPeer] = useState(false);
  const [isInitiator, setIsInitiator] = useState<boolean>();
  const dispatch = useDispatch();

  function signalPeer(data: MouseSignalData | KeyboardSignalData) {
    peer.current?.send(JSON.stringify(data));
  }

  useEffect(() => {
    if (isInitiator) {
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
          clientY: e.clientY - 25,
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
        e.preventDefault();
        e.stopPropagation();
        const data: MouseWheelData = {
          type: "wheel",
          deltaX: e.deltaX,
          deltaY: e.deltaY
        };
        signalPeer({ type: "mouse", data });
      };

      videoRef.current.onkeydown = (e) => {
        e.preventDefault();
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
    }
  }, [isInitiator]);

  useEffect(() => {
    socket.on(REMOTE_CONTROL_SIGNAL, async (data) => {
      const objData = JSON.parse(data) as RemoteControlSignal;
      console.log(data);

      switch (objData.type) {
        case RemoteControlSignalType.Ping:
          // Get offer from remote
          peer.current = await initPeerWithDesktopCapturer(objData.payload);
          // Pong back
          socket.invoke(REMOTE_CONTROL_SIGNAL, RemoteControlSignalType.Pong, objData.payload, getLoginData().id);
          setIsInitiator(false);
          setHasPeer(true);
          createNotification(NotificationType.RoomNotification, "Remote control session has started");
          break;
        case RemoteControlSignalType.Pong:
          peer.current = createPeer(objData.payload, true);
          setIsInitiator(true);
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
      console.log(remoteId);
      socket.invoke(REMOTE_CONTROL_SIGNAL, RemoteControlSignalType.Ping, remoteId, getLoginData().id);
      console.log("Start connection");
    } else {
      peer.current?.destroy();
      videoRef.current.style.display = "none";
      setHasPeer(false);
      setIsInitiator(undefined);
    }
  }, [isStarted]);

  useEffect(() => {
    if (peer.current && hasPeer) {
      peer.current.on("stream", (stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.style.display = "initial";
        dispatch(setRemoteControlWaitingModalOpen({ userId: null, isModalOpen: false }));
      });

      peer.current.on("data", (data) => {
        console.log("Received", JSON.parse(data));
        syncWithRemote(JSON.parse(data) as MouseSignalData | KeyboardSignalData);
      });

      peer.current.on("error", () => {
        peer.current.destroy();
        setHasPeer(false);
        createNotification(NotificationType.RoomNotification, "Remote control session has stopped");
      });
    }
  }, [hasPeer]);

  return (
    <div>
      <StyledVideo autoPlay ref={videoRef} tabIndex={-1} />
    </div>
  );
};

export default RemoteControl;
