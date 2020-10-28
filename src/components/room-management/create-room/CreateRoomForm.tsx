import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Field, Form, Formik, FormikProps } from "formik";
import moment from "moment";
import React, { useRef } from "react";
import {
  Button,
  DatePicker,
  Input,
  Modal,
  Notification,
  Textarea,
  TimePicker,
  WeekDayPicker,
  Picklist,
  Option
} from "react-rainbow-components";
import { WeekDayPickerProps } from "react-rainbow-components/components/WeekDayPicker";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import * as Yup from "yup";
import { RootState } from "~app/rootReducer";
import { createRoom, resetCreateRoomState, setRoomCreateModalOpen } from "./createRoomSlice";
import _ from "lodash";
const StyledNotification = styled(Notification)`
  width: 100%;
`;

const StyledPicklist = styled(Picklist)`
  width: fit-content;
`;
const StyledInput = styled(Input)`
  padding-bottom: 10px;
`;
const StyledTimePicker = styled(TimePicker)`
  width: fit-content;
`;
const StyledLabel = styled.label`
  color: ${(props) => props.theme.rainbow.palette.text.label};
  align-self: center;
  flex-grow: 2;
`;
const RepeatTimeContainer = styled.div`
  display: flex;
  padding-bottom: 10px;
`;
export interface CreateRoomFormValues {
  classroomName: string;
  startDate: Date;
  endDate: Date;
  description: string;
  repeatOccurrence: { name: string; label: string };
  repeatDays: string[];
  roomTime: { [dayOfWeek: string]: { startTime: string; endTime: string } };
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
  endDate: new Date(),
  description: "",
  repeatOccurrence: { name: "1", label: "Weekly" },
  repeatDays: [weekDayConvert(moment().isoWeekday())],
  roomTime: {}
};

export const validationSchema = Yup.object({
  classroomName: Yup.string().required("Classroom name is required").max(15, "Maximum of 15 characters"),
  startDate: Yup.date()
    .default(() => new Date())
    .required("Start date is required"),
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
      dispatch(createRoom(values));
    }
  }
  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit} innerRef={innerRef}>
      {({ values, setFieldValue, errors, touched }: FormikProps<CreateRoomFormValues>) => (
        <Form>
          <Field
            name="classroomName"
            label="Classroom Name"
            as={StyledInput}
            error={errors.classroomName && touched.classroomName ? errors.classroomName : null}
            placeholder="Enter classroom name"
          />
          <DatePicker
            style={{ paddingBottom: "10px" }}
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
          <div>
            <WeekDayPicker
              style={{ paddingBottom: "10px" }}
              multiple
              required
              label="Select days to repeat"
              value={values.repeatDays as WeekDayPickerProps["value"]}
              onChange={(e) => {
                setFieldValue("repeatDays", e);
                _.difference(values.repeatDays, e).forEach((value) => {
                  console.log(value);
                  delete values.roomTime[value];
                });
              }}
              error={errors.repeatDays ? errors.repeatDays : null}
            />
          </div>
          {values.repeatDays.map((value, index) => (
            <RepeatTimeContainer key={index}>
              <StyledLabel>Time for {value}</StyledLabel>
              <StyledTimePicker
                name={`roomTime[${value}].startTime`}
                label="Start time"
                value={values.roomTime[value]?.startTime}
                onChange={(e) => setFieldValue(`roomTime[${value}].startTime`, e)}
                error={!values.roomTime[value]?.startTime ? "Start Time is required" : null}
                placeholder="Choose a start time"
              />
              <StyledTimePicker
                name={`roomTime[${value}].endTime`}
                label="End time"
                value={values.roomTime[value]?.endTime}
                onChange={(e) => setFieldValue(`roomTime[${value}].endTime`, e)}
                error={
                  !values.roomTime[value]?.endTime
                    ? "End Time is required"
                    : moment(values.roomTime[value]?.endTime, "HH:mm").isSameOrBefore(
                        moment(values.roomTime[value]?.startTime, "HH:mm")
                      )
                    ? "End time must be after start time"
                    : null
                }
                placeholder="Choose an end time"
              />
            </RepeatTimeContainer>
          ))}

          <div className="rainbow-flex rainbow-justify_spread">
            <StyledPicklist
              style={{ paddingBottom: "10px" }}
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
              style={{ paddingBottom: "10px" }}
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
          <Field
            style={{ paddingBottom: "10px" }}
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
