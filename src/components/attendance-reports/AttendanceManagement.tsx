/* eslint-disable react/prop-types */
import { fetchAllSemesters } from "../management/semester/semesterSlice";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Checkbox, FormControlLabel } from "@material-ui/core";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { ButtonIcon, Picklist, Option, Notification } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { getCurrentRole, getUser } from "~utils/index";
import {
  AttendanceReport,
  AttendanceReportStudent,
  fetchAttendanceReports,
  resetAttendanceError,
  updateAttendances
} from "./attendanceReportSlice";
import Table from "./Table";

const Title = styled.h1`
  font-size: 2.5em;
  font-weight: 500;
  color: white;
  padding-right: 20px;
`;

interface Student {
  id: string;
  code: string;
  realName: string;
  email: string;
  status: "present" | "absent";
}

const StyledHeader = styled.header`
  background-color: ${(props) => props.theme.rainbow.palette.background.main};
  z-index: 1;
  display: flex;
  padding: 5 0 5 0;
  margin: 0 16 0 16;
  span {
    align-self: center;
    font-size: 16px;
    color: white;
  }
`;
const StyledNotifications = styled(Notification)`
  position: absolute;
  top: 20px;
  right: 20px;
  p {
    font-size: 16px;
  }
  h1 {
    font-size: 20px;
  }
  width: 30%;
`;
const AttendanceManagement = () => {
  const semesterState = useSelector((root: RootState) => root.semesterState);
  const attendanceReportState = useSelector((root: RootState) => root.attendanceReportState);
  const [selectedReport, setSelectedReport] = useState<AttendanceReport>();
  const [selectedSemester, setSelectedSemester] = useState<{ id: string; label: string }>();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllSemesters());
  }, []);

  useEffect(() => {
    setSelectedSemester({ id: _.last(semesterState.semesters)?.id, label: _.last(semesterState.semesters)?.name });
  }, [semesterState.semesters]);

  useEffect(() => {
    selectedSemester?.id && dispatch(fetchAttendanceReports(selectedSemester.id));
  }, [selectedSemester]);

  useEffect(() => {
    if (selectedReport) {
      setSelectedReport({
        ...selectedReport,
        students: _.find(attendanceReportState.reports, { id: selectedReport.id }).students
      });
    }
  }, [attendanceReportState]);

  return !selectedReport ? (
    <div>
      <div style={{ padding: "20px 10px 20px 20px" }}>
        <Title>Attendance Management</Title>
      </div>
      <Box marginX={3} marginBottom={3} width="15%">
        <Picklist
          value={{ label: selectedSemester?.label }}
          onChange={(value) => {
            setSelectedSemester({ id: value.name.toString(), label: value.label });
          }}
          label="Select semester"
        >
          {_.map(semesterState.semesters, (semester) => (
            <Option key={semester.id} name={semester.id} label={semester.name} />
          ))}
        </Picklist>
      </Box>
      <Box m={2}>
        <Table
          title="Sessions"
          data={_.map(attendanceReportState.reports, (v) => ({
            ...v,
            teacher: getUser(v.teacher).userName,
            room: `${v.subject}.${v.class}`
          }))}
          options={{
            draggable: false
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
              title: "Room",
              field: "room"
            },
            {
              title: "Teacher",
              field: "teacher"
            }
          ]}
          actions={[
            {
              icon: "groups",
              onClick: (e, data: AttendanceReport) => setSelectedReport(data),
              tooltip: "View attendance report"
            }
          ]}
        />
      </Box>
      {attendanceReportState.error ? (
        <StyledNotifications
          title="Error"
          onRequestClose={() => dispatch(resetAttendanceError())}
          description={attendanceReportState.error?.message}
          icon="error"
        />
      ) : null}
    </div>
  ) : (
    <div>
      <div style={{ padding: "20px 10px 20px 20px" }}>
        <Title>View attendance report</Title>
      </div>

      <StyledHeader>
        <ButtonIcon
          icon={<FontAwesomeIcon icon={faArrowLeft} />}
          onClick={() => setSelectedReport(undefined)}
          size="medium"
        />
        <span>Back to Attendance Management</span>
      </StyledHeader>
      <Box m={2} marginY={0}>
        <Table
          title={`${selectedReport.subject}.${selectedReport.class}`}
          data={_.map(selectedReport.students, (student) => {
            const studentInfo = getUser(student.id);
            return {
              id: student?.id,
              code: studentInfo?.userName,
              realName: studentInfo?.realName,
              email: studentInfo?.email,
              status: student?.status
            } as Student;
          })}
          options={{
            draggable: false
          }}
          columns={[
            {
              title: "Student Code",
              field: "code",
              editable: "never"
            },
            {
              title: "Real Name",
              field: "realName",
              editable: "never"
            },
            {
              title: "Email",
              field: "email",
              editable: "never"
            },
            {
              title: "Status",
              field: "status",
              // eslint-disable-next-line react/display-name
              editComponent: (props) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={props.value === "present"}
                      onChange={(e, checked) => props.onChange(checked ? "present" : "absent")}
                    />
                  }
                  label="Attended?"
                />
              ),
              // eslint-disable-next-line react/display-name
              render: (rowData: AttendanceReportStudent) => {
                switch (rowData.status) {
                  case "present":
                    return <b style={{ color: "#4ecca3" }}>Present</b>;
                  case "absent":
                    return <b style={{ color: "#fe4849" }}>Absent</b>;
                  default:
                    return <p>Future</p>;
                }
              }
            }
          ]}
          editable={
            getCurrentRole() !== "quality assurance"
              ? {
                  onRowUpdate: (newData: Student) => {
                    console.log(newData);
                    dispatch(
                      updateAttendances({
                        id: selectedReport.id,
                        students: [
                          {
                            id: newData.id,
                            status: newData.status
                          }
                        ]
                      })
                    );
                    return Promise.resolve();
                  },
                  onBulkUpdate: (changes) => {
                    const newData = _.map(changes, "newData") as Student[];
                    dispatch(
                      updateAttendances({
                        id: selectedReport.id,
                        students: _.map(newData, (student) => ({ id: student.id, status: student.status }))
                      })
                    );
                    return Promise.resolve();
                  }
                }
              : undefined
          }
        />
      </Box>
      {attendanceReportState.error ? (
        <StyledNotifications
          title="Error"
          onRequestClose={() => dispatch(resetAttendanceError())}
          description={attendanceReportState.error?.message}
          icon="error"
        />
      ) : null}
    </div>
  );
};

export default AttendanceManagement;
