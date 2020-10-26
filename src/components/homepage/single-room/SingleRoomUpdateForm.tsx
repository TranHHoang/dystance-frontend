import * as React from "react";
import { useEffect, useState } from "react";
import { Field, Form, Formik, FormikProps } from "formik";
import { CreateRoomFormValues, validationSchema } from "../../room-management/create-room/CreateRoomForm";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import { Room } from "~utils/types";
import moment from "moment";
import styled from "styled-components";
import {
  CheckboxToggle,
  DatePicker,
  Input,
  Picklist,
  Textarea,
  TimePicker,
  WeekDayPicker,
  Option,
  FileSelector
} from "react-rainbow-components";
import { WeekDayPickerProps } from "react-rainbow-components/components/WeekDayPicker";
import { setUpdateRepeatToggle, updateRoom } from "./singleRoomSlice";
import { hostName } from "~utils/hostUtils";

const StyledToggleButton = styled(CheckboxToggle)`
  padding: 15px 0 15px 0;
`;
const StyledPicklist = styled(Picklist)`
  width: fit-content;
`;
const CardContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: row;
`;
const ImageContainer = styled.div`
  width: 125px;
  margin-right: 5%;
`;

const StyledImage = styled.img`
  min-width: 125px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
`;
export const StyledFileSelector = styled(FileSelector)`
  margin-bottom: 15px;
  height: auto;
`;
export interface UpdateRoomFormValues extends CreateRoomFormValues {
  roomId: string;
  roomImage: File;
}

const SingleRoomUpdateForm = (props: any) => {
  const singleRoomState = useSelector((state: RootState) => state.singleRoomState);
  const [imgSrc, setImgSrc] = useState(null);
  const [rejectFile, setRejectFile] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const dispatch = useDispatch();
  const { room, innerRef } = props;
  const roomInfo = room as Room;

  function convertRepeatOccurrence(repeatOccurrence: string) {
    switch (repeatOccurrence) {
      case "1":
        return { name: "1", label: "Weekly" };
      case "8":
        return { name: "2", label: "Every 2 weeks" };
      case "3":
        return { name: "3", label: "Every 3 weeks" };
      case "4":
        return { name: "4", label: "Every 4 weeks" };
      case "5":
        return { name: "5", label: "Every 5 weeks" };
      case "6":
        return { name: "6", label: "Every 6 weeks" };
      case "7":
        return { name: "7", label: "Every 7 weeks" };
      case "8":
        return { name: "8", label: "Every 8 weeks" };
    }
  }

  const initialValues: UpdateRoomFormValues = {
    roomId: roomInfo.roomId,
    classroomName: roomInfo.roomName,
    startTime: moment(`${moment().format("YYYY-MM-DD")}T${roomInfo.startHour}`).format("HH:mm"),
    endTime: moment(`${moment().format("YYYY-MM-DD")}T${roomInfo.endHour}`).format("HH:mm"),
    startDate: moment(roomInfo.startDate).toDate(),
    endDate: moment(roomInfo.endDate).toDate(),
    description: roomInfo.description,
    repeatOccurrence: convertRepeatOccurrence(roomInfo.repeatOccurrence),
    repeatDays: JSON.parse(roomInfo.repeatDays),
    roomImage: null
  };

  function onSubmit(values: UpdateRoomFormValues) {
    dispatch(updateRoom(values, singleRoomState.updateRepeatToggle));
  }

  const handleChange = (files: File[]) => {
    if (files[0]?.name) {
      if (/(jpg|png|jpeg)$/i.test(files[0].name)) {
        if (files[0].size > 5 * 1024 * 1024) {
          setRejectFile(true);
          setRejectReason("File size is too large");
        } else {
          setRejectFile(false);
          const reader = new FileReader();
          const currentFile = files[0];
          if (currentFile) {
            reader.addEventListener(
              "load",
              () => {
                setImgSrc(reader.result);
              },
              false
            );
            reader.readAsDataURL(currentFile);
          }
        }
      } else {
        setRejectFile(true);
        setRejectReason("File type not supported");
      }
    }
  };
  return (
    <div>
      <CardContainer>
        <ImageContainer>
          <StyledImage src={!imgSrc ? `${hostName}/${roomInfo?.image}` : imgSrc} alt="" />
        </ImageContainer>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
          innerRef={innerRef}
        >
          {({ values, setFieldValue, errors, touched }: FormikProps<UpdateRoomFormValues>) => (
            <Form>
              <Field
                as={StyledFileSelector}
                name="roomImage"
                label="Change Room Image"
                placeholder="Drag and drop or select a file"
                accept="image/png, image/jpeg"
                onChange={(event: File[]) => {
                  handleChange(event);
                  setFieldValue("roomImage", event[0]);
                }}
                error={rejectFile ? rejectReason : null}
                value={values.roomImage || ""}
              />
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
                    values.endDate = e;
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
                value={singleRoomState.updateRepeatToggle}
                onChange={(e) => dispatch(setUpdateRepeatToggle(!singleRoomState.updateRepeatToggle))}
              />
              {singleRoomState.updateRepeatToggle ? (
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
      </CardContainer>
    </div>
  );
};
export default SingleRoomUpdateForm;
