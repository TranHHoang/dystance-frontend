import * as React from "react";
import { useState } from "react";
import { CreateRoomForm } from "../room-management/create-room/CreateRoomForm";
import { AllRooms } from "./all-rooms/AllRooms";

export const HomePage = () => {
  return (
    <div>
      <CreateRoomForm />
      <AllRooms />
    </div>
  );
};
