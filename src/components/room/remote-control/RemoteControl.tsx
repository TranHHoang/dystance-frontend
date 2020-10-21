/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import Peer, { Instance } from "simple-peer";
import { getLoginData } from "~utils/tokenStorage";
import { socket } from "../room-component/roomSlice";
//
// import wrtc from "wrtc";

const REMOTE_CONTROL_SIGNAL = "RemoteControlSignal";

enum RemoteControlSignalType {
  Ping,
  Pong,
  Signal
}

interface RemoteControlSignal {
  type: RemoteControlSignalType;
  payload: any;
}

function createPeer(remoteId: string, initiator: boolean, stream?: MediaStream) {
  const peer = new SimplePeer({ initiator, stream });

  peer.on("signal", (data) => {
    // Send my signal to remote machine
    socket.invoke(REMOTE_CONTROL_SIGNAL, RemoteControlSignalType.Signal, remoteId, JSON.stringify(data));
  });

  // peer.on("stream", (stream) => {
  //   console.log("on stream", stream);
  //   onStreamCallback(stream);
  // });

  peer.on("connect", () => {
    console.log("Connected");
  });

  // peer.on("data", (data) => {
  //   // TODO
  //   console.log("Data from remote: " + data);
  // });

  return peer;
}

async function initPeerWithDesktopCapturer(remoteId: string): Promise<Instance> {
  // const sources = await desktopCapturer.getSources({ types: ["window", "screen"] });
  // const screenSource = sources.filter(
  //   (source) => source.name === "Entire Screen" || source.name === "Screen 1" || source.name === "Screen 2"
  // )[0];

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

const RemoteControl = (props: any) => {
  // Initiator is trying to connect to remoteClient
  const { remoteId, isStarted } = props;
  const videoRef = useRef<HTMLVideoElement>();
  const peer = useRef<Instance>();
  const [hasPeer, setHasPeer] = useState(false);

  useEffect(() => {
    socket.on(REMOTE_CONTROL_SIGNAL, async (data) => {
      const objData = JSON.parse(data) as RemoteControlSignal;

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
      socket.invoke(REMOTE_CONTROL_SIGNAL, RemoteControlSignalType.Ping, remoteId, getLoginData().id);
    }
  }, [remoteId, isStarted]);

  useEffect(() => {
    if (peer.current) {
      peer.current.on("stream", (stream) => {
        videoRef.current.srcObject = stream;
      });

      peer.current.on("data", (data) => {
        console.log(data);
      });
    }
  }, [hasPeer]);

  return (
    <div>
      <video autoPlay ref={videoRef} />
    </div>
  );
};

export default RemoteControl;
