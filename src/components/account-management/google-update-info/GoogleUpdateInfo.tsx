import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import { startGoogleUpdateInfo } from "./googleUpdateInfoSlice";
import { faUser, faLock, faEnvelope, faCalendar } from "@fortawesome/free-solid-svg-icons";
import {
  BackgroundContainer,
  ButtonContainer,
  Container,
  StyledButton,
  StyledCard,
  StyledDatePicker,
  StyledForm,
  StyledInput,
  StyledNotification,
  Title
} from "../login/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Formik, Field, FormikProps, yupToFormErrors } from "formik";
import * as Yup from "yup";

export interface GoogleUpdateInfoFormValues {
  userName: string;
  realName: string;
  dob: Date;
}

const initialValues: GoogleUpdateInfoFormValues = {
  userName: "",
  realName: "",
  dob: new Date()
};
const validateSchema = Yup.object({
  userName: Yup.string().required("Username is required"),
  realName: Yup.string().required("Your name is required"),
  dob: Yup.date().required("Date of birth is required")
});

const GoogleUpdateInfoForm = () => {
  const updateInfoState = useSelector((state: RootState) => state.googleUpdateInfoState);
  const dispatch = useDispatch();

  function onSubmit(values: GoogleUpdateInfoFormValues) {
    dispatch(startGoogleUpdateInfo(values));
  }

  return (
    <BackgroundContainer>
      <Container>
        <StyledCard>
          <Title>Update User Info</Title>
          {updateInfoState.error && (
            <StyledNotification title={updateInfoState.error.message} hideCloseButton={true} icon="error" />
          )}
          {updateInfoState.isUpdateInfoSuccess && (
            <StyledNotification title="Update Successful. Redirecting..." hideCloseButton={true} icon="success" />
          )}
          <Formik initialValues={initialValues} validationSchema={validateSchema} onSubmit={onSubmit}>
            {({ errors, touched, values, setFieldValue }: FormikProps<GoogleUpdateInfoFormValues>) => (
              <StyledForm>
                <Field
                  name="userName"
                  as={StyledInput}
                  icon={<FontAwesomeIcon icon={faUser} />}
                  type="text"
                  label="Username"
                  placeholder="Enter your username"
                  error={errors.userName && touched.userName ? errors.userName : null}
                  required
                />
                <Field
                  name="realName"
                  as={StyledInput}
                  icon={<FontAwesomeIcon icon={faUser} />}
                  type="text"
                  label="Real Name"
                  placeholder="Enter your real name"
                  error={errors.realName && touched.realName ? errors.realName : null}
                  required
                />

                <StyledDatePicker
                  name="dob"
                  label="Date Of Birth"
                  locale="en-GB"
                  placeholder="Enter your date of birth"
                  value={values.dob}
                  onChange={(e) => setFieldValue("dob", e)}
                  error={errors.dob && touched.dob ? errors.dob : null}
                  required
                />

                <ButtonContainer>
                  <StyledButton variant="brand" type="submit" disabled={updateInfoState.isLoading}>
                    Update
                  </StyledButton>
                </ButtonContainer>
              </StyledForm>
            )}
          </Formik>
        </StyledCard>
      </Container>
    </BackgroundContainer>
  );
};

export default GoogleUpdateInfoForm;
