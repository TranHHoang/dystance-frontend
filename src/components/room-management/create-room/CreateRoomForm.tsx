import React, { useRef } from "react";
import { Modal, Button, Input, TimePicker, DatePicker, Textarea, Notification } from "react-rainbow-components";
import { RootState } from "../../../app/rootReducer";
import { useSelector, useDispatch } from "react-redux";
import { createRoom, setRoomCreateModalOpen } from "./createRoomSlice";
import styled from "styled-components";
import { Formik, Field, Form, FormikProps } from "formik";
import * as Yup from "yup";
import moment from "moment";

const StyledNotification = styled(Notification)`
    width: 100%;
`;

export interface CreateRoomFormValues {
    classroomName: string;
    startDate: Date;
    startTime: string;
    endTime: string;
    endDate: Date;
    description: string;
}

const initialValues: CreateRoomFormValues = {
    classroomName: "",
    startDate: new Date(),
    startTime: moment().format("HH:mm"),
    endTime: moment().format("HH:mm"),
    endDate: new Date(),
    description: ""
};

const validationSchema = Yup.object({
    classroomName: Yup.string().required("Classroom name is required"),
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
        })
});

const RoomFormComponent = (props: any) => {
    const dispatch = useDispatch();
    const { innerRef } = props;
    const createRoomState = useSelector((state: RootState) => state.createRoomState);

    function onSubmit(values: CreateRoomFormValues) {
        if (!createRoomState.isLoading) {
            dispatch(createRoom(values));
        }
    }

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            innerRef={innerRef}
        >
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
                        onChange={(e) => setFieldValue("startDate", e)}
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
                    <div className="rainbow-flex rainbow-justify_spread">
                        <DatePicker
                            name="endDate"
                            label="End Date"
                            value={values.endDate}
                            onChange={(e) => setFieldValue("endDate", e)}
                            error={errors.endDate && touched.endDate ? errors.endDate : null}
                            placeholder="Choose an end date"
                            locale="en-GB"
                            formatStyle="large"
                        />
                    </div>
                    <Field as={Textarea} name="description" label="Description" placeholder="Add description" />
                </Form>
            )}
        </Formik>
    );
};

const CreateRoomForm = () => {
    const dispatch = useDispatch();
    const createRoomState = useSelector((state: RootState) => state.createRoomState);

    const formRef = useRef(null);

    if (createRoomState.isCreationSuccess) {
        setTimeout(() => {
            dispatch(setRoomCreateModalOpen(false));
        }, 2000);
    }

    return (
        <div>
            <Button
                label="Create Room"
                onClick={() => dispatch(setRoomCreateModalOpen(true))}
                variant="brand"
                className="rainbow-m-around_medium"
            />
            <Modal
                id="create-room-modal"
                title="Create Classroom"
                isOpen={createRoomState.isModalOpen}
                hideCloseButton={true}
                footer={
                    <div className="rainbow-flex rainbow-justify_end">
                        <Button
                            form="redux-form-id"
                            className="rainbow-m-right_large"
                            label="Cancel"
                            variant="neutral"
                            onClick={() => dispatch(setRoomCreateModalOpen(false))}
                            disabled={createRoomState.isLoading || createRoomState.isCreationSuccess}
                        />
                        <Button
                            form="redux-form-id"
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
