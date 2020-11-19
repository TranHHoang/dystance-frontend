/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useEffect } from "react";
import { Column } from "material-table";
import { useDispatch, useSelector } from "react-redux";
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
import moment from "moment";

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

const ScheduleList = (props: { semesterId: string }) => {
  const { semesterId } = props;
  const scheduleState = useSelector((root: RootState) => root.scheduleState);
  const dispatch = useDispatch();
  const schedules = scheduleState.map(
    (s) =>
      ({
        ...s,
        startTime: moment(s.startTime, "HH:mm:ss").format("HH:mm"),
        endTime: moment(s.endTime, "HH:mm:ss").format("HH:mm")
      } as Schedule)
  );

  useEffect(() => {
    dispatch(fetchAllSchedule(semesterId));
  }, []);

  return (
    <Table
      title="Schedule"
      data={schedules}
      columns={columns}
      onRowAdd={(newData: Schedule) => {
        dispatch(addNewSchedule(semesterId, newData));
        return Promise.resolve();
      }}
      onRowUpdate={(newData: Schedule) => {
        dispatch(updateExistingSchedules(semesterId, [newData]));
        return Promise.resolve();
      }}
      onRowDelete={(oldData: { id: string }) => {
        dispatch(deleteExistingSchedules([oldData.id]));
        return Promise.resolve();
      }}
      onBulkUpdate={(changes) => {
        dispatch(updateExistingSchedules(semesterId, changes as Schedule[]));
        return Promise.resolve();
      }}
      onBulkDelete={(data) => dispatch(deleteExistingSchedules(_.map(data, "id")))}
    />
  );
};

export default ScheduleList;
