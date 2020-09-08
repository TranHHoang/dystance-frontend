import React, { useState, useEffect } from "react";
import { Field, reduxForm, InjectedFormProps, formValues } from "redux-form";
import { Modal, Button, Input, TimePicker, DatePicker, Textarea } from "react-rainbow-components";
import { RootState } from "../../../app/rootReducer";
import { useSelector, useDispatch } from "react-redux";
import { createRoom, createRoomCleanup } from "./createRoomSlice";

interface CreateRoomForm {
  classroomName: string;
  startDate: Date;
  startTime: string;
  endTime: string;
  endDate: Date;
  description: string;
}

const initialValues = {
  classroomName: "",
  startDate: new Date(),
  startTime: new Date().toLocaleTimeString("it-IT"),
  endTime: new Date().toLocaleTimeString("it-IT"),
  endDate: new Date(),
  description: ""
};

function validate(values: CreateRoomForm) {
  const { classroomName, startDate, startTime, endTime, endDate } = values;
  const errors = {
    classroomName: "",
    startDate: "",
    startTime: "",
    endTime: "",
    endDate: ""
  };
  if (!classroomName) {
    errors.classroomName = "Classroom Name is a required field";
  }
  if (!startDate) {
    errors.startDate = "Start Date is a required field";
  }
  if (!startTime) {
    errors.startTime = "Start Time is a required field";
  }
  if (!endTime) {
    errors.endTime = "End Time is a required field";
  }
  if (!endDate) {
    errors.endDate = "End Date is a required field";
  }

  if (startDate && endDate) {
    const startDateTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDateTime = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    if (endDateTime.getTime() < startDateTime.getTime()) {
      errors.endDate = "End Date must be after Start Date";
    }
    if (endDateTime.getTime() === startDateTime.getTime() && startTime >= endTime) {
      errors.endTime = "End Time must be after Start Time";
    }
  }

  return errors;
}

const RoomForm = (props: any) => {
  const { handleSubmit, reset, onSubmit } = props;

  const submit = (values: CreateRoomForm) => {
    onSubmit(values);
    reset();
  };
  return (
    <form id="redux-form-id" noValidate onSubmit={handleSubmit(submit)}>
      <Field component={Input} name="classroomName" required label="Class Name" placeholder="Enter classroom name" />

      <Field
        component={DatePicker}
        name="startDate"
        locale="en-GB"
        required
        label="Start Date"
        placeholder="Choose a start date"
      />
      <div className="rainbow-flex rainbow-justify_spread">
        <Field component={TimePicker} name="startTime" required label="Start Time" placeholder="Choose a start time" />
        <Field component={TimePicker} name="endTime" required label="End Time" placeholder="Choose an end time" />
      </div>
      <div className="rainbow-flex rainbow-justify_spread">
        <Field
          component={DatePicker}
          name="endDate"
          locale="en-GB"
          required
          label="End Date"
          placeholder="Choose an end date"
        />
      </div>
      <Field component={Textarea} name="description" label="Description" placeholder="Add note" />
    </form>
  );
};

const Form = reduxForm({
  form: "createRoomForm",
  validate
})(RoomForm);

export const CreateRoomForm = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const dispatch = useDispatch();
  const roomCreation = useSelector((state: RootState) => state.roomCreation);

  useEffect(() => {
    // a?.b.c --> null if a null
    // a.b.c --> exception if a null
    // 3 status: undefined = chua gui request, null = khong loi, error ... = co loi
    if (roomCreation?.error === null) {
      //
      setModalIsOpen(false);
    }
    dispatch(createRoomCleanup());
  }, [roomCreation.error]);

  const submit = (values: CreateRoomForm) => {
    if (!roomCreation.isLoading) {
      dispatch(
        createRoom(
          values.classroomName,
          values.startDate,
          values.startTime,
          values.endTime,
          values.endDate,
          values.description
        )
      );
    }
  };

  return (
    <div>
      <Button
        label="Create Room"
        onClick={() => setModalIsOpen(true)}
        variant="brand"
        className="rainbow-m-around_medium"
      />
      {roomCreation.error && <div>{roomCreation.error.message}</div>}
      <Modal
        title="Create Classroom"
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        footer={
          <div className="rainbow-flex rainbow-justify_end">
            <Button
              form="redux-form-id"
              className="rainbow-m-right_large"
              label="Cancel"
              variant="neutral"
              onClick={() => setModalIsOpen(false)}
            />
            <Button form="redux-form-id" label="Save" variant="brand" type="submit" disabled={roomCreation.isLoading} />
          </div>
        }
      >
        <Form onSubmit={submit} initialValues={initialValues} />
      </Modal>
    </div>
  );
};
