import StudentList from "../../lists/student-list/StudentList";
import TeacherList from "../../lists/teacher-list/TeacherList";
import React, { useEffect } from "react";
import { Tabset, Tab } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { setSemesterDetailsTabsetValue } from "./semesterDetailsSlice";

const Title = styled.h1`
  font-size: 2.5em;
  font-weight: 500;
  color: white;
  padding-right: 20px;
`;
export const Container = styled.div`
  padding: 20px;
  width: 100%;
`;

const StyledTab = styled(Tab)`
  button {
    font-size: 16px;
  }
`;

const SemesterDetails = () => {
  const semesterPageState = useSelector((state: RootState) => state.semesterDetailsState);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSemesterDetailsTabsetValue("students"));
  }, []);

  function getTabContent() {
    switch (semesterPageState.tabsetValue) {
      case "schedule":
        return;
      case "classes":
        return;
      case "students":
        return <StudentList />;
      case "teachers":
        return <TeacherList />;
    }
  }
  return (
    <>
      <div style={{ padding: "20px 0 10px 20px" }}>
        <Title>Semester Details</Title>
      </div>
      <Container>
        <Tabset
          activeTabName={semesterPageState.tabsetValue}
          onSelect={(_, selected) => {
            dispatch(setSemesterDetailsTabsetValue(selected));
          }}
        >
          <StyledTab label="Schedule" name="schedule" />
          <StyledTab label="Classes" name="classes" />
          <StyledTab label="Students" name="students" />
          <StyledTab label="Teachers" name="teachers" />
        </Tabset>
        {getTabContent()}
      </Container>
    </>
  );
};

export default SemesterDetails;
