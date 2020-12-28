import React, { useEffect } from "react";
import { useState } from "react";
import styled from "styled-components";
import { WeeklyCalendar } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import moment from "moment";
import { resetTimetable, showTimetableEvents } from "./timetableSlice";
import { setDrawerOpen, setEvent } from "./event-details/eventDetailsSlice";
import EventDetailsDrawer from "./event-details/EventDetails";

export const Container = styled.div`
  padding: 20px;
  width: 100%;
`;
const StyledWeeklyCalendar = styled(WeeklyCalendar)`
  font-size: 16px;
  padding: 1rem;
  height: 88vh;
`;
const Title = styled.h1`
  font-size: 2.5em;
  font-weight: 500;
  /* color: white; */
  padding-right: 20px;
`;

export enum TimetableEventType {
  Schedule,
  Deadline
}

export interface TimetableEvent {
  id: string;
  eventType: TimetableEventType;
  roomId: string;
  title: string;
  teacherId: string;
  description: string;
  startDate: string;
  endDate: string;
}

const Timetable = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const dispatch = useDispatch();
  const timetableState = useSelector((state: RootState) => state.timetableState);

  const events = timetableState.events.map((event) => ({
    ...event,
    startDate: new Date(`${event.startDate}`),
    endDate: new Date(`${event.endDate}`)
  }));

  useEffect(() => {
    dispatch(resetTimetable());
    dispatch(setDrawerOpen(false));
    const startOfWeek = moment().startOf("week").toDate();
    const endOfWeek = moment().endOf("week").toDate();
    dispatch(showTimetableEvents(startOfWeek, endOfWeek));
    return () => {
      dispatch(resetTimetable());
    };
  }, []);

  return (
    <>
      <div style={{ padding: "20px 0 10px 20px" }}>
        <Title>Timetable</Title>
      </div>
      <Container>
        <StyledWeeklyCalendar
          events={events}
          currentWeek={currentWeek}
          onWeekChange={({ week }) => {
            const endOfWeek = new Date(week);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            setCurrentWeek(week);
            dispatch(showTimetableEvents(week, endOfWeek));
          }}
          onEventClick={(event: any) => {
            dispatch(setDrawerOpen(true));
            dispatch(
              setEvent({ ...event, startDate: event.startDate.toISOString(), endDate: event.endDate.toISOString() })
            );
          }}
        />
        <EventDetailsDrawer />
      </Container>
    </>
  );
};

export default Timetable;
