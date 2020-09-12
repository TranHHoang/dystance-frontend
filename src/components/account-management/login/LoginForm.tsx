import React from "react";
import GoogleLogin, { GoogleLoginResponse } from "react-google-login";
import config from "./googleConfigs.json";
import { useDispatch, useSelector } from "react-redux";
import { startLogin, LoginError, resendEmail } from "./loginSlice";
import { RootState } from "$app/rootReducer";
import { Field, reduxForm, FormErrors } from "redux-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import {
  ButtonContainer,
  Container,
  Register,
  ResendButton,
  StyledButton,
  StyledCard,
  StyledForm,
  StyledGoogleIcon,
  StyledInput,
  StyledLink,
  StyledNotification,
  Title
} from "./styles";

interface LoginForm {
  emailOrUserName: string;
  password: string;
}

export enum LoginLocalStorageKey {
  EmailOrUserName = "login/emailOrUserName",
  GoogleEmail = "login/googleEmail"
}

function validate(values: LoginForm): FormErrors<LoginForm, string> {
  const errors = {
    emailOrUserName: "",
    password: ""
  };

  if (!values?.emailOrUserName) {
    errors.emailOrUserName = "Required";
  } else if (/\@/.test(values.emailOrUserName)) {
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.emailOrUserName)) {
      errors.emailOrUserName = "Invalid email";
    }
  }

  if (!values.password) {
    errors.password = "Required";
  }

  return errors;
}

const requiredField = ({ input, label, type, meta: { touched, error } }: any) => (
  <div>
    <label>{label}</label>
    <div>
      <input {...input} placeholder={label} type={type} />
      {touched && error && <span>{error}</span>}
    </div>
  </div>
);

const LoginForm = reduxForm({
  form: "login-form",
  validate
})((props: any) => {
  const { handleSubmit } = props;
  const loginState = useSelector((state: RootState) => state.loginState);
  const dispatch = useDispatch();

  const _: any = undefined;

  function onSubmit(values: LoginForm) {
    window.localStorage.setItem(LoginLocalStorageKey.EmailOrUserName, values.emailOrUserName); // Save for resend email

    if (/\@/.test(values.emailOrUserName)) {
      dispatch(startLogin(values.emailOrUserName, _, values.password));
    } else {
      dispatch(startLogin(_, values.emailOrUserName, values.password));
    }
  }

  function onGoogleResponse(response: GoogleLoginResponse) {
    window.localStorage.setItem(LoginLocalStorageKey.GoogleEmail, response.profileObj.email);
    dispatch(startLogin(_, _, _, response.tokenId));
  }

  function onResendEmail() {
    const emailOrUserName = window.localStorage.getItem(LoginLocalStorageKey.EmailOrUserName);

    if (/\@/.test(emailOrUserName)) {
      dispatch(resendEmail(_, emailOrUserName));
    } else {
      dispatch(resendEmail(emailOrUserName));
    }
  }

  let resendEmailSection: JSX.Element;

  if (loginState.error?.type === LoginError.EmailIsNotConfirmed) {
    if (loginState.resendEmailLoading === undefined) {
      resendEmailSection = (
        <StyledNotification
          title={
            <ResendButton variant="base" onClick={onResendEmail}>
              Click here to resend confirmation email
            </ResendButton>
          }
          hideCloseButton={true}
          icon="warning"
        />
      );
    } else if (loginState.resendEmailLoading) {
      resendEmailSection = <StyledNotification title="Sending..." hideCloseButton={true} icon="warning" />;
    } else if (!loginState.resendEmailLoading && !loginState.resendEmailError) {
      console.log(loginState);

      resendEmailSection = (
        <span>
          <span>Resend email successful! Does not work?</span>
          <button onClick={onResendEmail}>Click here to try again</button>
        </span>
      );
    } else {
      resendEmailSection = (
        <StyledNotification title={loginState.resendEmailError} hideCloseButton={true} icon="error" />
      );
    }
  }

  return (
    <Container>
      <Title>Sign in</Title>
      <Register>
        Don't have an account? <span> </span>
        <StyledLink to="/register">Create Account Here</StyledLink>
      </Register>
      <StyledCard>
        {loginState.error && (
          <StyledNotification title={loginState.error.message} hideCloseButton={true} icon="error" />
        )}
        {loginState.isLoginSuccess && (
          <StyledNotification title="Login successful. Redirecting..." hideCloseButton={true} icon="success" />
        )}
        {resendEmailSection}

        <StyledForm onSubmit={handleSubmit(onSubmit)}>
          <Field
            component={StyledInput}
            icon={<FontAwesomeIcon icon={faUser} />}
            name="emailOrUserName"
            required
            label="Email/User name"
            placeholder="Enter email or username"
          />
          <Field
            component={StyledInput}
            icon={<FontAwesomeIcon icon={faLock} />}
            type="password"
            name="password"
            required
            label="Password"
            placeholder="Enter password"
          />
          <ButtonContainer>
            <StyledButton type="submit" label="Sign In" variant="brand" disabled={loginState.isLoading} />
            <GoogleLogin
              clientId={config.GoogleClientId}
              onSuccess={onGoogleResponse}
              onFailure={(e) => console.log(e)}
              render={(renderProps) => (
                <StyledButton onClick={renderProps.onClick}>
                  <StyledGoogleIcon icon={faGoogle} />
                  Login with Google
                </StyledButton>
              )}
              cookiePolicy="single_host_origin"
            />
          </ButtonContainer>
          <StyledLink to="/register">Forgot your password?</StyledLink>
        </StyledForm>
      </StyledCard>
    </Container>
  );
});

export default LoginForm;
