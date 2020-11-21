import { Box, createMuiTheme, makeStyles, MuiThemeProvider, Tab, Tabs, Theme } from "@material-ui/core";
import { fetchAllSemesters } from "../../semester-management/semesterSlice";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { Picklist, Option } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { AllUsersInfo, User } from "~utils/types";
import { AttendanceReport, fetchAttendanceReports } from "./attendanceReportSlice";
import Table from "./Table";

const Title = styled.h1`
  font-size: 2.5em;
  font-weight: 500;
  color: white;
  padding-right: 20px;
`;

const theme = createMuiTheme({
  palette: {
    type: "dark",
    background: {
      paper: "#36393f"
    },
    secondary: {
      main: "#4ecca3"
    }
  }
});

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    display: "flex",
    height: 300
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`
  }
}));

const StudentAttendanceReport = () => {
  const semesterState = useSelector((root: RootState) => root.semesterState);
  const attendanceReportState = useSelector((root: RootState) => root.attendanceReportState);
  const attendanceByClass = _.groupBy(attendanceReportState, (report) => `${report.subject}.${report.class}`);
  const allUsers = JSON.parse(sessionStorage.getItem(AllUsersInfo)) as User[];
  const [tab, setTab] = useState(0);
  const [selectedSemester, setSelectedSemester] = useState<{ id: string; label: string }>();
  const dispatch = useDispatch();
  const classes = useStyles();

  useEffect(() => {
    dispatch(fetchAllSemesters());
  }, []);

  useEffect(() => {
    setSelectedSemester({ id: _.last(semesterState)?.id, label: _.last(semesterState)?.name });
  }, [semesterState]);

  useEffect(() => {
    if (selectedSemester) {
      dispatch(fetchAttendanceReports(selectedSemester.id));
    }
  }, [selectedSemester]);

  return (
    <div>
      <div style={{ padding: "20px 10px 20px 20px" }}>
        <Title>Your attendance reports</Title>
      </div>
      <Box marginX={3} marginBottom={3} width="15%">
        <Picklist
          value={{ label: selectedSemester?.label }}
          onChange={(value) => {
            setSelectedSemester({ id: value.name.toString(), label: value.label });
          }}
          label="Select semester"
        >
          {_.map(semesterState, (semester) => (
            <Option key={semester.id} name={semester.id} label={semester.name} />
          ))}
        </Picklist>
      </Box>
      <MuiThemeProvider theme={theme}>
        <div className={classes.root}>
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={tab}
            onChange={(_, value) => setTab(value)}
            textColor="secondary"
            className={classes.tabs}
          >
            {_(attendanceByClass)
              .keys()
              .map((className) => <Tab key={className} label={className} />)
              .value()}
          </Tabs>
          <Box width="100%" marginX={2}>
            <Table
              data={_.values(attendanceByClass)[tab]?.map((x) => ({
                ...x,
                teacher: _.find(allUsers, { id: x.teacher }).userName
              }))}
              options={{
                toolbar: false,
                draggable: false,
                filtering: false,
                sorting: false
              }}
              columns={[
                {
                  title: "Date",
                  field: "date"
                },
                {
                  title: "Start Time",
                  field: "startTime"
                },
                {
                  title: "End Time",
                  field: "endTime"
                },
                {
                  title: "Teacher",
                  field: "teacher"
                },
                {
                  title: "Attendance",
                  field: "status",
                  // eslint-disable-next-line react/display-name
                  render: (rowData: AttendanceReport) => {
                    switch (rowData.status) {
                      case "present":
                        return <b style={{ color: "#4ecca3" }}>Present</b>;
                      case "absent":
                        return <b style={{ color: "#FE4849" }}>Absent</b>;
                      default:
                        return <p>Future</p>;
                    }
                  }
                }
              ]}
            />
          </Box>
        </div>
      </MuiThemeProvider>
    </div>
  );
};

export default StudentAttendanceReport;
