import * as React from "react";
import { useEffect } from "react";
import { Spinner } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { resetRoom, showRoom } from "../showRoomsSlice";
import { SingleRoom } from "../single-room/SingleRoom";

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
    return () => {
      dispatch(resetRoom());
    };
  }, []);

  return (
    <BackgroundContainer>
      {showRoomState.isLoading ? (
        <Spinner variant="brand" size="large" />
      ) : (
        <Container>
          {showRoomState.rooms.map((room) => (
            <div key={room.roomId}>
              <SingleRoom
                roomId={room.roomId}
                creatorId={room.creatorId}
                roomName={room.roomName}
                startDate={room.startDate}
                endDate={room.endDate}
                image={room.image}
                description={room.description}
                repeatOccurrence={room.repeatOccurrence}
                repeatDays={room.repeatDays}
                roomTimes={room.roomTimes}
              />
            </div>
          ))}
        </Container>
      )}
    </BackgroundContainer>
  );
};
