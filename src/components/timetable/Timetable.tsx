import React, { useEffect } from "react";
import { useState } from "react";
import styled from "styled-components";
import { WeeklyCalendar } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import moment from "moment";
import { showTimetableEvents } from "./timetableSlice";

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

  // const firstDay = new Date();
  // firstDay.setDate(firstDay.getDate() - firstDay.getDay());
  // const daysOfWeek = Array.from(Array(7), (_value, index) => {
  //   const day = new Date(firstDay);
  //   day.setDate(day.getDate() + index);
  //   return day;
  // });
  // console.log(new Date(daysOfWeek[0].setHours(5,0,0,0)));
  // console.log(new Date("2020-10-17T06:00:00"));
  useEffect(() => {
    const startOfWeek = moment().startOf("week").toDate();
    const endOfWeek = moment().endOf("week").toDate();
    // console.log(startOfWeek);
    dispatch(showTimetableEvents(startOfWeek, endOfWeek));
  }, []);
  return (
    <Container>
      <StyledWeeklyCalendar
        // events={events}
        currentWeek={currentWeek}
        onWeekChange={({ week }) => {
          const endOfWeek = new Date(week);
          endOfWeek.setDate(endOfWeek.getDate() + 6);
          setCurrentWeek(week);
        }}
      />
    </Container>
  );
};

export default Timetable;
