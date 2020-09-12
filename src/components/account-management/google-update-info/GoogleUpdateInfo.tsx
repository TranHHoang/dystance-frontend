import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import { Field, reduxForm, FormErrors } from "redux-form";
import { startGoogleUpdateInfo } from "./googleUpdateInfoSlice";
import { faUser, faLock, faEnvelope, faCalendar } from "@fortawesome/free-solid-svg-icons";
import {
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
interface GoogleUpdateInfoForm {
  userName: string;
  realName: string;
  dob: Date;
}

function validate(values: GoogleUpdateInfoForm): FormErrors<GoogleUpdateInfoForm, string> {
  const errors = {
    userName: "",
    realName: "",
    dob: ""
  };

  if (!values?.userName) {
    errors.userName = "Required";
  }

  if (!values.realName) {
    errors.realName = "Required";
  }

  if (!values.dob) {
    errors.dob = "Required";
  }

  return errors;
}
const GoogleUpdateInfoForm = reduxForm({
  form: "google-update-info-form",
  validate
})((props: any) => {
  const { handleSubmit } = props;
  const updateInfoState = useSelector((state: RootState) => state.googleUpdateInfoState);
  const dispatch = useDispatch();

  function onSubmit(values: GoogleUpdateInfoForm) {
    dispatch(startGoogleUpdateInfo(values.userName, values.realName, values.dob));
  }

  return (
    <Container>
      <Title>Update User Info</Title>
      <StyledCard>
        {updateInfoState.error && (
          <StyledNotification title={updateInfoState.error.message} hideCloseButton={true} icon="error" />
        )}

        <StyledForm onSubmit={handleSubmit(onSubmit)}>
          <Field
            name="userName"
            component={StyledInput}
            icon={<FontAwesomeIcon icon={faUser} />}
            type="text"
            label="Username"
            placeholder="Enter your username"
            required
          />
          <Field
            name="realName"
            component={StyledInput}
            icon={<FontAwesomeIcon icon={faUser} />}
            type="text"
            label="Real Name"
            placeholder="Enter your real name"
            required
          />
          <Field
            name="dob"
            component={StyledDatePicker}
            label="Date Of Birth"
            locale="en-GB"
            placeholder="Enter your date of birth"
            required
          />
          <ButtonContainer>
            <StyledButton variant="brand" type="submit" disabled={updateInfoState.isLoading}>
              Update
            </StyledButton>
          </ButtonContainer>
        </StyledForm>
      </StyledCard>
    </Container>
  );
});

export default GoogleUpdateInfoForm;
