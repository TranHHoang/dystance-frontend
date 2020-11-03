import * as React from "react";
import { useState } from "react";
import { Field, Form, Formik, FormikProps } from "formik";
import {
  CreateRoomFormValues,
  validationSchema,
  weekDayConvert
} from "../../room-management/create-room/CreateRoomForm";
import { useDispatch } from "react-redux";
import { Room } from "~utils/types";
import moment from "moment";
import styled from "styled-components";
import {
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
import { updateRoom } from "./singleRoomSlice";
import { hostName } from "~utils/hostUtils";
import _ from "lodash";

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
export interface UpdateRoomFormValues extends CreateRoomFormValues {
  roomId: string;
  roomImage: File;
}

interface RoomTimes {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}
const SingleRoomUpdateForm = (props: any) => {
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
      default:
        return { name: repeatOccurrence, label: `Every ${repeatOccurrence} weeks` };
    }
  }

  const initialValues: UpdateRoomFormValues = {
    roomId: roomInfo.roomId,
    classroomName: roomInfo.roomName,
    startDate: moment(roomInfo.startDate).toDate(),
    endDate: moment(roomInfo.endDate).toDate(),
    description: roomInfo.description,
    repeatOccurrence: convertRepeatOccurrence(roomInfo.repeatOccurrence),
    repeatDays: _.map(JSON.parse(roomInfo.roomTimes) as RoomTimes[], (value) => value.dayOfWeek),
    roomImage: null,
    roomTime: _.transform(
      JSON.parse(roomInfo.roomTimes) as RoomTimes[],
      (dict, value) => {
        dict[value.dayOfWeek] = {
          startTime: moment(`${moment().format("YYYY-MM-DD")}T${value.startTime}`).format("HH:mm"),
          endTime: moment(`${moment().format("YYYY-MM-DD")}T${value.endTime}`).format("HH:mm")
        };
      },
      {} as { [dayOfWeek: string]: { startTime: string; endTime: string } }
    )
  };

  function onSubmit(values: UpdateRoomFormValues) {
    dispatch(updateRoom(values));
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
                  setFieldValue("repeatDays", [weekDayConvert(moment(e).isoWeekday())]);
                  if (moment(e).isAfter(moment(values.endDate), "day")) {
                    setFieldValue("endDate", e);
                    values.endDate = e;
                  }
                }}
                error={errors.startDate && touched.startDate ? errors.startDate : null}
                locale="en-GB"
                formatStyle="large"
              />
              <WeekDayPicker
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
