/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useEffect } from "react";
import MaterialTable, { Action, Column } from "material-table";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import {
  addNewSchedule,
  deleteExistingSchedule,
  fetchAllSchedule,
  Schedule,
  updateExistingSchedule
} from "./scheduleSlice";
import { TimePicker } from "react-rainbow-components";

const StyledDiv = styled.div`
  div::before {
    display: initial;
  }
`;

const columns: Column<object>[] = [
  {
    title: "Date",
    field: "date",
    type: "date"
  },
  {
    title: "Start time",
    field: "startTime",
    editComponent: (props) => <TimePicker value={props.value} onChange={(e) => props.onChange(e)} />
  },
  {
    title: "End time",
    field: "endTime",
    editComponent: (props) => <TimePicker value={props.value} onChange={(e) => props.onChange(e)} />
  },
  {
    title: "Subject",
    field: "subject"
  },
  {
    title: "Class",
    field: "class"
  }
];

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#4ecca3"
    }
  },
  typography: {
    allVariants: {
      color: "#fff"
    }
  }
});

const data = [
  { id: 1, date: "12-12-2020", startTime: "12:04", endTime: "15:00", subject: "SWD301", class: "IS1301" },
  { id: 1, date: "12-12-2020", startTime: "12:04", endTime: "15:00", subject: "SWD301", class: "IS1301" },
  { id: 1, date: "12-12-2020", startTime: "12:04", endTime: "15:00", subject: "SWD301", class: "IS1301" },
  { id: 1, date: "12-12-2020", startTime: "12:04", endTime: "15:00", subject: "SWD301", class: "IS1301" },
  { id: 1, date: "12-12-2020", startTime: "12:04", endTime: "15:00", subject: "SWD301", class: "IS1301" }
];

const ScheduleManagement = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllSchedule());
  }, []);

  return (
    <StyledDiv style={{ margin: 8 }}>
      <MuiThemeProvider theme={theme}>
        <MaterialTable
          title="Schedules"
          columns={columns}
          data={data}
          options={{
            actionsColumnIndex: -1,
            rowStyle: { color: "#fff" },
            filtering: true,
            selection: true
          }}
          editable={{
            onRowAdd: (newData: Schedule) => {
              dispatch(addNewSchedule(newData));
              return Promise.resolve();
            },
            onRowUpdate: (oldData, newData: Schedule) => {
              dispatch(updateExistingSchedule(newData));
              return Promise.resolve();
            },
            onRowDelete: (oldData: { id: string }) => {
              dispatch(deleteExistingSchedule(oldData.id));
              return Promise.resolve();
            }
          }}
          actions={[
            {
              icon: "delete",
              tooltip: "Delete all selected",
              onClick: (e, data) => dispatch(deleteExistingSchedule(data.id))
            }
          ]}
        />
      </MuiThemeProvider>
    </StyledDiv>
  );
};

export default ScheduleManagement;
