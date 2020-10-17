import React, { useEffect } from "react";
import { useState } from "react";
import styled from "styled-components";
import { WeeklyCalendar } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import moment from "moment";
import { showTimetableEvents } from "./timetableSlice";
import { setDrawerOpen, setEvent, showCreatorInfo } from "./event-details/eventDetailsSlice";
import EventDetailsDrawer from "./event-details/EventDetails";

export const Container = styled.div`
  padding: 20px;
  width: 100%;
  margin-left: 130px;
`;
const StyledWeeklyCalendar = styled(WeeklyCalendar)`
  font-size: 16px;
  padding: 1rem;
`;

const Timetable = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const dispatch = useDispatch();
  const timetableState = useSelector((state: RootState) => state.timetableState);
  const eventDetailsState = useSelector((state: RootState) => state.eventDetailsState);

  const events = timetableState.events.map((event) => ({
    ...event,
    startDate: new Date(`${event.startDate}`),
    endDate: new Date(`${event.endDate}`)
  }));
  useEffect(() => {
    const startOfWeek = moment().startOf("week").toDate();
    const endOfWeek = moment().endOf("week").toDate();
    dispatch(showTimetableEvents(startOfWeek, endOfWeek));
  }, []);

  useEffect(() => {
    const calendarEvents = document.querySelectorAll("div[id^='calendar-event']");
    calendarEvents.forEach((event) => {
      const span = event.querySelector("span");
      if (span.innerHTML.startsWith("Deadline - ")) {
        event.style.backgroundColor = "#FE4849";
        event.style.padding = "5px";
        event.style.height = "auto";
      }
    });
  }, [timetableState.events]);

  return (
    <Container>
      <StyledWeeklyCalendar
        events={events}
        currentWeek={currentWeek}
        onWeekChange={({ week }) => {
          const endOfWeek = new Date(week);
          endOfWeek.setDate(endOfWeek.getDate() + 6);
          setCurrentWeek(week);
        }}
        onEventClick={(event: any) => {
          dispatch(setDrawerOpen(true));
          dispatch(setEvent(event));
          dispatch(showCreatorInfo(event.creatorId));
        }}
      />
      <EventDetailsDrawer />
    </Container>
  );
};

export default Timetable;
