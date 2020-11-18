/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useEffect } from "react";
import MaterialTable, { Column } from "material-table";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import {
  addNewSchedule,
  deleteExistingSchedules,
  fetchAllSchedule,
  Schedule,
  updateExistingSchedules
} from "./scheduleSlice";
import { TimePicker } from "react-rainbow-components";
import _ from "lodash";
import { RootState } from "~app/rootReducer";
import Table from "../Table";

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

const ScheduleManagement = () => {
  const scheduleState = useSelector((root: RootState) => root.scheduleState);
  const dispatch = useDispatch();
  const schedules = scheduleState.map((s) => ({ ...s }));

  useEffect(() => {
    dispatch(fetchAllSchedule());
  }, []);

  return (
    <Table
      title="Schedule"
      data={schedules}
      columns={columns}
      onRowAdd={(newData: Schedule) => {
        dispatch(addNewSchedule(newData));
        return Promise.resolve();
      }}
      onRowUpdate={(newData: Schedule) => {
        dispatch(updateExistingSchedules([newData]));
        return Promise.resolve();
      }}
      onRowDelete={(oldData: { id: string }) => {
        dispatch(deleteExistingSchedules([oldData.id]));
        return Promise.resolve();
      }}
      onBulkUpdate={(changes) => {
        dispatch(updateExistingSchedules(changes as Schedule[]));
        return Promise.resolve();
      }}
      onBulkDelete={(data) => dispatch(deleteExistingSchedules(_.map(data, "id")))}
    />
  );
};

export default ScheduleManagement;
