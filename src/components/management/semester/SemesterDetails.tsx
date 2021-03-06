import React, { useState } from "react";
import { Tabset, Tab } from "react-rainbow-components";
import styled from "styled-components";
import ScheduleList from "../schedule/ScheduleList";
import ClassList from "../class/ClassList";

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

const SemesterDetails = (props: { semesterId: string }) => {
  const { semesterId } = props;
  const [tabsetValue, setTabsetValue] = useState("classes");

  function getTabContent() {
    switch (tabsetValue) {
      case "schedule":
        return <ScheduleList semesterId={semesterId} />;
      case "classes":
        return <ClassList semesterId={semesterId} />;
    }
  }
  return (
    <>
      <div style={{ padding: "10px 0 10px 20px" }}>
        <Title>Semester Details</Title>
      </div>
      <Container>
        <Tabset
          activeTabName={tabsetValue}
          onSelect={(_, selected) => {
            setTabsetValue(selected);
          }}
        >
          <StyledTab label="Classes" name="classes" />
          <StyledTab label="Schedule" name="schedule" />
        </Tabset>
        {getTabContent()}
      </Container>
    </>
  );
};

export default SemesterDetails;
