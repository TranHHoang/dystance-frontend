import React from "react";
import CreateRoomForm from "../room-management/create-room/CreateRoomForm";
import { AllRooms } from "./all-rooms/AllRooms";
import styled from "styled-components";
import { Button } from "react-rainbow-components";
import { signOut } from "../account-management/signout/signOut";
import { useDispatch } from "react-redux";

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

  return (
    <div>
      <Button onClick={() => dispatch(signOut())} label="Sign Out" />
      <AllRoomsDiv>
        <Title>All Rooms</Title>
        <CreateRoomForm />
      </AllRoomsDiv>
      <AllRooms />
    </div>
  );
};
