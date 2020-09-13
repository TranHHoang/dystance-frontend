import * as React from "react";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../app/rootReducer";
import { showRoom } from "../showRoomsSlice";
import { SingleRoom } from "../single-room/SingleRoom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
`;

export const AllRooms = () => {
  const showRoomState = useSelector((state: RootState) => state.showRoomState);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(showRoom());
  }, []);

  return (
    <Container>
      {showRoomState.rooms.map((room) => (
        <div key={room.id}>
          <SingleRoom
            name={room.name}
            startHour={room.startHour}
            endHour={room.endHour}
            image={room.image}
            description={room.description}
          />
        </div>
      ))}
    </Container>
  );
};
