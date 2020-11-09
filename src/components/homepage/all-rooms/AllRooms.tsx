import * as React from "react";
import { useEffect } from "react";
import { Button, Spinner } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { resetRoom, showRoom } from "../showRoomsSlice";
import { SingleRoom } from "../single-room/SingleRoom";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
const RoomFilterContainer = styled.div`
  display: flex;
  width: 100%;
  padding: 10 0 10 20;
`;
export const AllRooms = () => {
  const showRoomState = useSelector((state: RootState) => state.showRoomState);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(showRoom());
  }, []);

  return (
    <BackgroundContainer>
      <RoomFilterContainer>
        <Button
          variant="neutral"
          onClick={() => {
            dispatch(resetRoom());
            dispatch(showRoom());
          }}
        >
          <FontAwesomeIcon icon={faSyncAlt} className="rainbow-m-right_medium" />
          Refresh
        </Button>
      </RoomFilterContainer>
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
