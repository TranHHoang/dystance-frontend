/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useEffect, useState } from "react";
import { Column } from "material-table";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewSchedule,
  deleteExistingSchedules,
  fetchAllSchedule,
  Schedule,
  updateExistingSchedules,
  resetErrorState,
  resetScheduleState
} from "./scheduleSlice";
import { TimePicker, Notification } from "react-rainbow-components";
import _ from "lodash";
import { RootState } from "~app/rootReducer";
import Table from "../Table";
import moment from "moment";
import * as Yup from "yup";
import styled from "styled-components";

const StyledNotifications = styled(Notification)`
  position: absolute;
  top: 50px;
  right: 20px;
  p {
    font-size: 16px;
  }
  h1 {
    font-size: 20px;
  }
  width: 30%;
`;

const ScheduleList = (props: { semesterId: string }) => {
  const { semesterId } = props;
  const scheduleState = useSelector((root: RootState) => root.scheduleState);
  const [timeError, setTimeError] = useState(false);
  const dispatch = useDispatch();
  const schedules = scheduleState.schedules?.map(
    (s) =>
      ({
        ...s,
        startTime: moment(s.startTime, "HH:mm:ss").format("HH:mm"),
        endTime: moment(s.endTime, "HH:mm:ss").format("HH:mm")
      } as Schedule)
  );

  const columns: Column<object>[] = [
    {
      title: "Date",
      field: "date",
      type: "date",
      validate: (rowData: Schedule) => Yup.date().required().isValidSync(rowData.date)
    },
    {
      title: "Start time",
      field: "startTime",
      editComponent: (props) => <TimePicker value={props.value} onChange={(e) => props.onChange(e)} />,
      validate: (rowData: Schedule) => Yup.string().required().isValidSync(rowData.startTime)
    },
    {
      title: "End time",
      field: "endTime",
      editComponent: (props) => (
        <TimePicker value={props.value} onChange={(e) => props.onChange(e)} error={timeError ? true : false} />
      ),
      validate: (rowData: Schedule) => Yup.string().required().isValidSync(rowData.endTime)
    },
    {
      title: "Subject",
      field: "subject",
      validate: (rowData: Schedule) => Yup.string().required().isValidSync(rowData.subject)
    },
    {
      title: "Class",
      field: "class",
      validate: (rowData: Schedule) => Yup.string().required().isValidSync(rowData.class)
    }
  ];
  useEffect(() => {
    dispatch(fetchAllSchedule(semesterId));
    return () => {
      dispatch(resetScheduleState());
    };
  }, []);

  return (
    <>
      <Table
        title="Schedule"
        data={schedules}
        columns={columns}
        onRowAdd={(newData: Schedule) => {
          const format = {
            date: moment(newData.date).format("YYYY-MM-DD"),
            startTime: newData.startTime,
            endTime: newData.endTime,
            subject: newData.subject,
            class: newData.class
          };
          if (_.some(format, _.isEmpty)) {
            return Promise.reject();
          } else if (moment(format.endTime, "HH:mm").isSameOrBefore(moment(format.startTime, "HH:mm"))) {
            setTimeError(true);
            return Promise.reject();
          } else {
            setTimeError(false);
            dispatch(resetErrorState());
            dispatch(addNewSchedule(semesterId, newData));
            return Promise.resolve();
          }
        }}
        onRowUpdate={(newData: Schedule) => {
          const format = {
            date: moment(newData.date).format("YYYY-MM-DD"),
            startTime: newData.startTime,
            endTime: newData.endTime,
            subject: newData.subject,
            class: newData.class
          };
          if (_.some(format, _.isEmpty)) {
            return Promise.reject();
          } else if (moment(format.endTime, "HH:mm").isSameOrBefore(moment(format.startTime, "HH:mm"))) {
            setTimeError(true);
            return Promise.reject();
          } else {
            dispatch(resetErrorState());
            setTimeError(false);
            dispatch(updateExistingSchedules(semesterId, [newData]));
            return Promise.resolve();
          }
        }}
        onRowDelete={(oldData: { id: string }) => {
          dispatch(resetErrorState());
          dispatch(deleteExistingSchedules([oldData.id]));
          return Promise.resolve();
        }}
        onBulkUpdate={(changes) =>
          new Promise((resolve, reject) => {
            const validated = _.every(changes, (change) => {
              const format = {
                date: moment(change.date).format("YYYY-MM-DD"),
                startTime: change.startTime,
                endTime: change.endTime,
                subject: change.subject,
                class: change.class
              };
              if (_.some(format, _.isEmpty)) {
                reject();
                return false;
              } else if (moment(format.endTime, "HH:mm").isSameOrBefore(moment(format.startTime, "HH:mm"))) {
                setTimeError(true);
                reject();
                return false;
              } else {
                setTimeError(false);
              }
              return true;
            });
            if (validated) {
              dispatch(resetErrorState());
              dispatch(updateExistingSchedules(semesterId, changes as Schedule[]));
              resolve();
            }
          })
        }
        onBulkDelete={(data) => {
          dispatch(resetErrorState());
          dispatch(deleteExistingSchedules(_.map(data, "id")));
        }}
      />
      {timeError ? (
        <StyledNotifications
          title="Error"
          onRequestClose={() => setTimeError(false)}
          description="End time cannot be smaller than start time"
          icon="error"
        />
      ) : null}
      {scheduleState.error ? (
        <StyledNotifications
          title="Error"
          onRequestClose={() => dispatch(resetErrorState())}
          description={scheduleState.error?.message}
          icon="error"
        />
      ) : null}
    </>
  );
};

export default ScheduleList;
