import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Field, Form, Formik, FormikProps } from "formik";
import moment from "moment";
import React, { useRef, useState } from "react";
import {
  Button,
  DatePicker,
  Input,
  Modal,
  Notification,
  Textarea,
  TimePicker,
  CheckboxToggle,
  WeekDayPicker,
  Picklist,
  Option
} from "react-rainbow-components";
import { WeekDayPickerProps } from "react-rainbow-components/components/WeekDayPicker";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import * as Yup from "yup";
import { RootState } from "~app/rootReducer";
import { createRoom, resetCreateRoomState, setRepeatToggle, setRoomCreateModalOpen } from "./createRoomSlice";

const StyledNotification = styled(Notification)`
  width: 100%;
`;
const StyledToggleButton = styled(CheckboxToggle)`
  padding: 15px 0 15px 0;
`;
const StyledPicklist = styled(Picklist)`
  width: fit-content;
`;
export interface CreateRoomFormValues {
  classroomName: string;
  startDate: Date;
  startTime: string;
  endTime: string;
  endDate: Date;
  description: string;
  repeatOccurrence: { name: string; label: string };
  repeatDays: string[];
}

export const weekDayConvert = (weekDayISO: number) => {
  switch (weekDayISO) {
    case 1:
      return "monday";
    case 2:
      return "tuesday";
    case 3:
      return "wednesday";
    case 4:
      return "thursday";
    case 5:
      return "friday";
    case 6:
      return "saturday";
    case 7:
      return "sunday";
  }
};
const initialValues: CreateRoomFormValues = {
  classroomName: "",
  startDate: new Date(),
  startTime: moment().format("HH:mm"),
  endTime: moment().format("HH:mm"),
  endDate: new Date(),
  description: "",
  repeatOccurrence: { name: "1", label: "Weekly" },
  repeatDays: [weekDayConvert(moment().isoWeekday())]
};

export const validationSchema = Yup.object({
  classroomName: Yup.string().required("Classroom name is required").max(15, "Maximum of 15 characters"),
  startDate: Yup.date()
    .default(() => new Date())
    .required("Start date is required"),
  startTime: Yup.string().required("Start time is required"),
  endTime: Yup.string()
    .required("End time is required")
    .test("is-time-greater", "End time must be after start time", function (value) {
      const { startTime } = this.parent;
      return moment(value, "HH:mm").isAfter(moment(startTime, "HH:mm"));
    }),
  endDate: Yup.date()
    .default(() => new Date())
    .required("End date is required")
    .test("is-date-greater", "End date must be after start date", function (value) {
      const { startDate } = this.parent;
      return moment(value).isSameOrAfter(moment(startDate), "day");
    }),
  description: Yup.string().max(150, "Maximum of 150 characters"),
  repeatDays: Yup.array().required("This field is required")
});

const RoomFormComponent = (props: any) => {
  const dispatch = useDispatch();
  const { innerRef } = props;
  const createRoomState = useSelector((state: RootState) => state.roomCreation);

  function onSubmit(values: CreateRoomFormValues) {
    if (!createRoomState.isLoading) {
      dispatch(createRoom(values, createRoomState.repeatToggle));
    }
  }

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit} innerRef={innerRef}>
      {({ values, setFieldValue, errors, touched }: FormikProps<CreateRoomFormValues>) => (
        <Form>
          <Field
            name="classroomName"
            label="Classroom Name"
            as={Input}
            error={errors.classroomName && touched.classroomName ? errors.classroomName : null}
            placeholder="Enter classroom name"
          />

          <DatePicker
            name="startDate"
            label="Start date"
            value={values.startDate}
            onChange={(e) => {
              setFieldValue("startDate", e);
              if (moment(e).isAfter(moment(values.endDate), "day")) {
                setFieldValue("endDate", e);
              }
            }}
            error={errors.startDate && touched.startDate ? errors.startDate : null}
            locale="en-GB"
            formatStyle="large"
          />

          <div className="rainbow-flex rainbow-justify_spread">
            <TimePicker
              name="startTime"
              label="Start time"
              value={values.startTime}
              onChange={(e) => setFieldValue("startTime", e)}
              error={errors.startTime && touched.startTime ? errors.startTime : null}
              placeholder="Choose a start time"
            />

            <TimePicker
              name="endTime"
              label="End time"
              value={values.endTime}
              onChange={(e) => setFieldValue("endTime", e)}
              error={errors.endTime && touched.endTime ? errors.endTime : null}
              placeholder="Choose an end time"
            />
          </div>

          <StyledToggleButton
            name="repeatToggle"
            label="Repeat?"
            value={createRoomState.repeatToggle}
            onChange={(e) => dispatch(setRepeatToggle(!createRoomState.repeatToggle))}
          />
          {createRoomState.repeatToggle ? (
            <div>
              <div>
                <WeekDayPicker
                  multiple
                  required
                  label="Select days to repeat"
                  value={values.repeatDays as WeekDayPickerProps["value"]}
                  onChange={(e) => {
                    setFieldValue("repeatDays", e);
                  }}
                  error={errors.repeatDays ? errors.repeatDays : null}
                />
              </div>
              <div className="rainbow-flex rainbow-justify_spread">
                <StyledPicklist
                  label="Repeat"
                  name="weeklyRepeat"
                  value={values.repeatOccurrence}
                  onChange={(e) => setFieldValue("repeatOccurrence", e)}
                >
                  <Option name="1" label="Every week" />
                  <Option name="2" label="Every 2 weeks" />
                  <Option name="3" label="Every 3 weeks" />
                  <Option name="4" label="Every 4 weeks" />
                  <Option name="5" label="Every 5 weeks" />
                  <Option name="6" label="Every 6 weeks" />
                  <Option name="7" label="Every 7 weeks" />
                  <Option name="8" label="Every 8 weeks" />
                </StyledPicklist>
                <DatePicker
                  name="endDate"
                  label="End Date"
                  value={values.endDate}
                  onChange={(e) => {
                    setFieldValue("endDate", e);
                  }}
                  error={errors.endDate && touched.endDate ? errors.endDate : null}
                  placeholder="Choose an end date"
                  locale="en-GB"
                  formatStyle="large"
                />
              </div>
            </div>
          ) : null}
          <Field
            as={Textarea}
            name="description"
            label="Description"
            placeholder="Add description"
            error={errors.description && touched.description ? errors.description : null}
          />
        </Form>
      )}
    </Formik>
  );
};

const CreateRoomForm = () => {
  const dispatch = useDispatch();
  const createRoomState = useSelector((state: RootState) => state.roomCreation);

  const formRef = useRef(null);

  if (createRoomState.isCreationSuccess) {
    dispatch(setRoomCreateModalOpen(false));
  }

  return (
    <div>
      <Button
        onClick={() => dispatch(setRoomCreateModalOpen(true))}
        variant="brand"
        className="rainbow-m-around_medium"
      >
        <FontAwesomeIcon icon={faPlus} className="rainbow-m-right_medium" />
        Create Room
      </Button>
      <Modal
        id="create-room-modal"
        title="Create Classroom"
        isOpen={createRoomState.isModalOpen}
        hideCloseButton={true}
        footer={
          <div className="rainbow-flex rainbow-justify_end">
            <Button
              className="rainbow-m-right_large"
              label="Cancel"
              variant="neutral"
              onClick={() => {
                dispatch(setRoomCreateModalOpen(false));
                dispatch(resetCreateRoomState());
              }}
              disabled={createRoomState.isLoading || createRoomState.isCreationSuccess}
            />
            <Button
              label="Save"
              variant="brand"
              type="submit"
              onClick={() => formRef.current.handleSubmit()}
              disabled={createRoomState.isLoading || createRoomState.isCreationSuccess}
            />
          </div>
        }
      >
        {createRoomState.error && (
          <StyledNotification
            title="An Error Occured"
            hideCloseButton={true}
            description={createRoomState.error.message}
            icon="error"
          />
        )}
        {createRoomState.isCreationSuccess && (
          <StyledNotification
            title="Classroom Created Successfully"
            hideCloseButton={true}
            description="You will be redirected to the homepage shortly"
            icon="success"
          />
        )}
        <RoomFormComponent innerRef={formRef} />
      </Modal>
    </div>
  );
};

export default CreateRoomForm;
