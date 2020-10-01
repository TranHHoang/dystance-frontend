import React from "react";
import CreateRoomForm from "../room-management/create-room/CreateRoomForm";
import { AllRooms } from "./all-rooms/AllRooms";
import styled from "styled-components";
import { Button } from "react-rainbow-components";
import { useDispatch } from "react-redux";
import config from "../account-management/login/googleConfigs.json";
import { useGoogleLogout } from "react-google-login";
import { signOut } from "../account-management/signout/signOut";

const AllRoomsDiv = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 0 20px 20px;
`;

const Title = styled.h1`
  font-size: 2.5em;
  font-weight: 500;
  color: white;
  padding-right: 20px;
`;

export const HomePage = () => {
  const dispatch = useDispatch();

  const googleLogout = useGoogleLogout({
    clientId: config.GoogleClientId,
    onLogoutSuccess: () => console.log("Google signed out"),
    onFailure: () => console.log("Google signed out error")
  });

  return (
    <div>
      <Button
        onClick={() => {
          googleLogout.signOut();
          dispatch(signOut());
        }}
        label="Sign Out"
      />
      <AllRoomsDiv>
        <Title>All Rooms</Title>
        <CreateRoomForm />
      </AllRoomsDiv>
      <AllRooms />
    </div>
  );
};
