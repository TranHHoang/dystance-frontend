import React, { useEffect, useRef } from "react";
import { useState } from "react";
import styled from "styled-components";
import {
  Button,
  DatePicker,
  Input,
  Modal,
  TimePicker,
  Textarea,
  Notification,
  Accordion
} from "react-rainbow-components";
import * as Yup from "yup";
import { Field, Form, Formik, FormikProps } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import moment from "moment";
import { createDeadline, resetDeadlines, setDeadlineModalOpen, showDeadlines } from "./deadlineListSlice";
import DeadlineCard from "./deadline-card/DeadlineCard";
import { getLoginData } from "~utils/tokenStorage";
import { updateDeadline } from "./deadline-card/deadlineCardSlice";

const ButtonDiv = styled.div`
  display: flex;
  justify-content: center;
`;
const StyledAccordion = styled(Accordion)`
  background-color: ${(props) => props.theme.rainbow.palette.background.main};
`;
export enum DeadlineError {
  OutOfDateRange = 1
}
export const StyledInput = styled(Input)`
  margin-bottom: 15px;

  label {
    font-size: 15px;
    align-self: flex-start;
    margin-bottom: 10px;
  }
  input,
  input:focus {
    padding: 20px 1rem 20px 1.5rem;
  }
`;
const StyledNotification = styled(Notification)`
  width: 100%;
`;

export interface CreateDeadlineFormValues {
  deadlineId: string;
  title: string;
  deadlineTime: string;
  deadlineDate: Date;
  description: string;
  roomId: string;
}

const validationSchema = Yup.object({
  title: Yup.string().required("Deadline Title is required").max(100, "Maximum of 100 characters"),
  description: Yup.string().max(150, "Maximum of 150 characters"),
  deadlineTime: Yup.string().required("Deadline Time is required"),
  deadlineDate: Yup.date()
    .default(() => new Date())
    .required("Deadline Date is required")
});

export const DeadlineFormComponent = (props: any) => {
  const dispatch = useDispatch();
  const { innerRef, roomId, deadline } = props;
  const deadlineListState = useSelector((state: RootState) => state.deadlineListState);
  const deadlineCardState = useSelector((state: RootState) => state.deadlineCardState);
  const initialValues: CreateDeadlineFormValues = {
    deadlineId: deadline?.deadlineId || "",
    title: deadline?.title || "",
    deadlineTime: moment(deadline?.endDate || new Date()).format("HH:mm"),
    deadlineDate: moment(deadline?.endDate || new Date()).toDate(),
    description: deadline?.description || "",

    roomId: roomId
  };
  function onSubmit(values: CreateDeadlineFormValues) {
    if (deadlineCardState.isUpdateModalOpen) {
      dispatch(updateDeadline(values));
    } else if (deadlineListState.isDeadlineModalOpen) {
      dispatch(createDeadline(values));
    }
  }

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit} innerRef={innerRef}>
      {({ errors, touched, values, setFieldValue }: FormikProps<CreateDeadlineFormValues>) => (
        <Form>
          <Field
            name="title"
            as={StyledInput}
            type="text"
            label="Deadline Title"
            value={values.title}
            error={errors.title && touched.title ? errors.title : null}
          />
          <div className="rainbow-flex rainbow-justify_spread">
            <TimePicker
              name="deadlineTime"
              label="Deadline Time"
              value={values.deadlineTime || ""}
              onChange={(e) => setFieldValue("deadlineTime", e)}
              error={errors.deadlineTime && touched.deadlineTime ? errors.deadlineTime : null}
            />
            <DatePicker
              name="deadlineDate"
              label="Deadline Date"
              value={values.deadlineDate || ""}
              onChange={(e) => setFieldValue("deadlineDate", e)}
              error={
                (deadlineListState.error && deadlineListState.error.type === DeadlineError.OutOfDateRange) ||
                (deadlineCardState.error && deadlineCardState.error.type === DeadlineError.OutOfDateRange)
                  ? deadlineListState.error?.message || deadlineCardState.error?.message
                  : errors.deadlineDate && touched.deadlineDate
                  ? errors.deadlineDate
                  : null
              }
              locale="en-GB"
              formatStyle="large"
            />
          </div>
          <Field
            as={Textarea}
            name="description"
            label="Description"
            value={values.description || ""}
            placeholder="Add description"
            error={errors.description && touched.description ? errors.description : null}
          />
        </Form>
      )}
    </Formik>
  );
};
const DeadlineListComponent = (props: any) => {
  const deadlineListState = useSelector((state: RootState) => state.deadlineListState);
  const dispatch = useDispatch();
  const formRef = useRef(null);
  const { roomId, creatorId } = props;

  useEffect(() => {
    dispatch(resetDeadlines());
    dispatch(showDeadlines(roomId));
    return () => {
      dispatch(resetDeadlines());
    };
  }, []);
  function reset() {
    formRef?.current.resetForm();
    dispatch(setDeadlineModalOpen(false));
  }
  return (
    <div>
      {deadlineListState.deadlines.map((deadline) => (
        <div key={deadline.deadlineId}>
          <StyledAccordion>
            <DeadlineCard
              deadlineId={deadline.deadlineId}
              title={deadline.title}
              endDate={deadline.endDate}
              description={deadline.description}
              roomId={deadline.roomId}
              creatorId={creatorId}
            />
          </StyledAccordion>
        </div>
      ))}
      {creatorId === getLoginData().id ? (
        <ButtonDiv>
          <Button variant="brand" label="Create a deadline" onClick={() => dispatch(setDeadlineModalOpen(true))} />
        </ButtonDiv>
      ) : null}
      <Modal
        isOpen={deadlineListState.isDeadlineModalOpen}
        title="Create Deadline"
        hideCloseButton={true}
        footer={
          <div className="rainbow-flex rainbow-justify_end">
            <Button
              className="rainbow-m-right_large"
              label="Cancel"
              variant="neutral"
              onClick={() => reset()}
              disabled={deadlineListState.isLoading || deadlineListState.isDeadlineCreationSuccess}
            />
            <Button
              label="Save"
              variant="brand"
              type="submit"
              onClick={() => formRef.current.handleSubmit()}
              disabled={deadlineListState.isLoading || deadlineListState.isDeadlineCreationSuccess}
            />
          </div>
        }
      >
        {deadlineListState.error && deadlineListState.error.type !== 1 ? (
          <StyledNotification
            title="An Error Occured"
            hideCloseButton={true}
            description={deadlineListState.error.message}
            icon="error"
          />
        ) : null}
        {deadlineListState.isDeadlineCreationSuccess && (
          <StyledNotification
            title="Deadline Created Successfully"
            hideCloseButton={true}
            description="Your deadline will appear shortly"
            icon="success"
          />
        )}
        <DeadlineFormComponent innerRef={formRef} roomId={roomId} creatorId={creatorId} />
      </Modal>
    </div>
  );
};

export default DeadlineListComponent;
