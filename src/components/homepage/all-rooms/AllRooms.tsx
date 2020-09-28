import * as React from "react";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "~app/rootReducer";
import { showRoom } from "../showRoomsSlice";
import { SingleRoom } from "../single-room/SingleRoom";
import styled from "styled-components";

const BackgroundContainer = styled.div`
  background-color: ${(props) => props.theme.rainbow.palette.background.secondary};
  height: 100%;
  overflow: auto;
`;
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
    <BackgroundContainer>
      <Container>
        {showRoomState.rooms.map((room) => (
          <div key={room.roomId}>
            <SingleRoom
              roomId={room.roomId}
              creatorId={room.creatorId}
              roomName={room.roomName}
              startHour={room.startHour}
              endHour={room.endHour}
              image={room.image}
              description={room.description}
            />
          </div>
        ))}
      </Container>
    </BackgroundContainer>
  );
};
