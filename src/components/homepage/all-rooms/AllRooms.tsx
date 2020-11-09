import React, { useState } from "react";
import { useEffect, useRef } from "react";
import { Button, Input, Picklist, Spinner, Option, Accordion, AccordionSection } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { resetRoom, showRoom } from "../showRoomsSlice";
import { SingleRoom } from "../single-room/SingleRoom";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getLoginData } from "~utils/tokenStorage";

const BackgroundContainer = styled.div`
  background-color: ${(props) => props.theme.rainbow.palette.background.secondary};
  height: 100%;
  overflow: auto;
  width: 100%;
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
  align-items: flex-end;
`;
export const StyledInput = styled(Input)`
  margin-right: 20px;
  label {
    font-size: 15px;
    align-self: flex-start;
  }
  input,
  input:focus {
    padding: 20px 1rem 20px 1.5rem;
  }
`;
const StyledButton = styled(Button)`
  height: 45px;
`;
const StyledAccordionSection = styled(AccordionSection)`
  span {
    font-size: 25px;
  }
  width: 95%;
`;
export const AllRooms = () => {
  const showRoomState = useSelector((state: RootState) => state.showRoomState);
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState(["invited-accordion"]);
  const searchedRooms = showRoomState.rooms.filter((room) => room.roomName.toLowerCase().includes(query.toLowerCase()));
  const invitedRooms = searchedRooms.filter((room) => room.creatorId !== getLoginData().id);
  const createdRooms = searchedRooms.filter((room) => room.creatorId === getLoginData().id);

  useEffect(() => {
    dispatch(showRoom());
    return () => {
      dispatch(resetRoom());
    };
  }, []);

  return (
    <BackgroundContainer>
      <RoomFilterContainer>
        <form style={{ margin: "0" }}>
          <StyledInput
            label="Search for Room"
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />
        </form>
        <StyledButton
          variant="neutral"
          onClick={() => {
            dispatch(resetRoom());
            dispatch(showRoom());
          }}
        >
          <FontAwesomeIcon icon={faSyncAlt} className="rainbow-m-right_medium" />
          Refresh
        </StyledButton>
      </RoomFilterContainer>
      {showRoomState.isLoading ? (
        <Spinner variant="brand" size="large" />
      ) : (
        <Accordion
          multiple
          activeSectionNames={activeSection}
          onToggleSection={(_, activeNames: any) => setActiveSection(activeNames)}
        >
          <StyledAccordionSection
            name="invited-accordion"
            label={
              invitedRooms.length === 1
                ? "Invited Rooms (" + invitedRooms.length + " Room)"
                : "Invited Rooms (" + invitedRooms.length + " Rooms)"
            }
          >
            <Container>
              {invitedRooms.map((room) => (
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
          </StyledAccordionSection>
          <StyledAccordionSection
            name="created-accordion"
            label={
              createdRooms.length === 1
                ? "Created Rooms (" + createdRooms.length + " Room)"
                : "Created Rooms (" + createdRooms.length + " Rooms)"
            }
          >
            <Container>
              {createdRooms.map((room) => (
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
          </StyledAccordionSection>
        </Accordion>
      )}
    </BackgroundContainer>
  );
};
