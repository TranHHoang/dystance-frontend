import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { startRegister } from "./registerSlice";
import { RootState } from "$app/rootReducer";
import { Field, reduxForm, FormErrors } from "redux-form";
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
interface RegisterForm {
  userName: string;
  email: string;
  password: string;
  rePassword: string;
  realName: string;
  dob: Date;
}

const initialFormState: RegisterForm = {
  userName: "",
  email: "",
  password: "",
  rePassword: "",
  realName: "",
  dob: new Date()
};

function validate(values: RegisterForm): FormErrors<RegisterForm, string> {
  const errors = {
    userName: "",
    email: "",
    password: "",
    rePassword: "",
    realName: "",
    dob: ""
  };

  if (!values?.userName) {
    errors.userName = "Required";
  }

  if (!values?.email) {
    errors.email = "Required";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = "Invalid email";
  }

  if (!values.password) {
    errors.password = "Required";
  }

  if (!values.rePassword) {
    errors.rePassword = "Required";
  }

  if (values?.password !== values?.rePassword) {
    errors.rePassword = "Password does not match";
  }

  if (!values.realName) {
    errors.realName = "Required";
  }

  if (!values.dob) {
    errors.dob = "Required";
  } else if (values.dob.getTime() > new Date().getTime()) {
    errors.dob = "Invalid date of birth";
  }

  return errors;
}

const RegisterForm = reduxForm({
  form: "register-form",
  initialValues: initialFormState,
  validate
})(({ handleSubmit }) => {
  const registerState = useSelector((state: RootState) => state.registerState);
  const dispatch = useDispatch();

  function onSubmit(values: RegisterForm) {
    dispatch(startRegister(values.email, values.userName, values.password, values.realName, values.dob));
  }

  return (
    <Container>
      <Title>Create Your Account</Title>
      {registerState.error && (
        <StyledNotification title={registerState.error.message} hideCloseButton={true} icon="error" />
      )}
      <StyledCard>
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
            name="email"
            component={StyledInput}
            icon={<FontAwesomeIcon icon={faEnvelope} />}
            type="email"
            label="Email"
            placeholder="Enter your email"
            required
          />
          <Field
            name="password"
            component={StyledInput}
            icon={<FontAwesomeIcon icon={faLock} />}
            type="password"
            label="Password"
            placeholder="Enter your password"
            required
          />
          <Field
            name="rePassword"
            component={StyledInput}
            icon={<FontAwesomeIcon icon={faLock} />}
            type="password"
            label="Re-enter Password"
            placeholder="Re-enter your password"
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
            <StyledButton variant="brand" type="submit" disabled={registerState.isLoading}>
              Register
            </StyledButton>
          </ButtonContainer>
        </StyledForm>
      </StyledCard>
    </Container>
  );
});

export default RegisterForm;
