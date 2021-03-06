import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Field, Formik, FormikProps } from "formik";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import * as Yup from "yup";
import { RootState } from "~app/rootReducer";
import { LoginLocalStorageKey } from "~utils/interfaces";
import * as resetPasswordSlice from "../reset-password/resetPasswordSlice";
import {
  BackgroundContainer,
  ButtonContainer,
  Container,
  NotificationContainer,
  ResendButton,
  StyledButton,
  StyledCard,
  StyledForm,
  StyledGoogleIcon,
  StyledInput,
  StyledLink,
  StyledNotification,
  Title
} from "../styles";
import config from "./googleConfigs.json";
import { LoginError, resendEmail, resetLoginState, startLogin } from "./loginSlice";
import GoogleLogin, { GoogleLoginResponse } from "react-google-login";

interface LoginFormValues {
  emailOrUserName: string;
  password: string;
}

const initialValues: LoginFormValues = {
  emailOrUserName: "",
  password: ""
};

const validateSchema = Yup.object({
  emailOrUserName: Yup.lazy((value: string) =>
    /\@/.test(value)
      ? Yup.string().email("Invalid email").required("This field is required")
      : Yup.string().required("This field is required")
  ),
  password: Yup.string().required("Password is required")
});

const LoginForm = () => {
  const loginState = useSelector((state: RootState) => state.loginState);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetLoginState());
  }, [dispatch]);

  if (LoginLocalStorageKey.UserInfo in localStorage) {
    return <Redirect to="/homepage" />;
  }

  const _: any = undefined;

  function onSubmit(values: LoginFormValues) {
    window.localStorage.setItem(LoginLocalStorageKey.EmailOrUserName, values.emailOrUserName); // Save for resend email

    if (/\@/.test(values.emailOrUserName)) {
      dispatch(startLogin(values.emailOrUserName, _, values.password));
    } else {
      dispatch(startLogin(_, values.emailOrUserName, values.password));
    }
  }

  function onGoogleResponse(response: GoogleLoginResponse) {
    window.localStorage.setItem(LoginLocalStorageKey.EmailOrUserName, response.profileObj.email);
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
              Your email is not confirmed. Click here to resend confirmation email
            </ResendButton>
          }
          hideCloseButton={true}
          icon="warning"
        />
      );
    } else if (loginState.resendEmailLoading) {
      resendEmailSection = <StyledNotification title="Sending..." hideCloseButton={true} icon="warning" />;
    } else if (!loginState.resendEmailLoading && !loginState.resendEmailError) {
      resendEmailSection = (
        <NotificationContainer>
          <StyledNotification title="Resend Email Successful!" hideCloseButton={true} icon="success" />
          <StyledNotification
            title={
              <ResendButton variant="base" onClick={onResendEmail}>
                Didn't work? Click here to try again
              </ResendButton>
            }
            hideCloseButton={true}
            icon="warning"
          />
        </NotificationContainer>
      );
    } else {
      resendEmailSection = (
        <StyledNotification title={loginState.resendEmailError} hideCloseButton={true} icon="error" />
      );
    }
  }

  return (
    <BackgroundContainer>
      <Container>
        <Title>Sign in</Title>

        <StyledCard>
          {loginState.error && loginState.error.type !== LoginError.EmailIsNotConfirmed && (
            <StyledNotification title={loginState.error.message} hideCloseButton={true} icon="error" />
          )}
          {loginState.isLoginSuccess && (
            <StyledNotification title="Login successful. Redirecting..." hideCloseButton={true} icon="success" />
          )}
          {resendEmailSection}

          <Formik initialValues={initialValues} validationSchema={validateSchema} onSubmit={onSubmit}>
            {({ errors, touched }: FormikProps<LoginFormValues>) => (
              <StyledForm>
                <Field
                  name="emailOrUserName"
                  label="Email or User name"
                  as={StyledInput}
                  icon={<FontAwesomeIcon icon={faUser} />}
                  error={errors.emailOrUserName && touched.emailOrUserName ? errors.emailOrUserName : null}
                  placeholder="Enter email or username"
                />
                <Field
                  name="password"
                  label="Password"
                  as={StyledInput}
                  icon={<FontAwesomeIcon icon={faLock} />}
                  type="password"
                  error={errors.password && touched.password ? errors.password : null}
                  placeholder="Enter password"
                />
                <ButtonContainer>
                  <StyledButton type="submit" label="Sign In" variant="brand" disabled={loginState.isLoading} />
                  <GoogleLogin
                    clientId={config.GoogleClientId}
                    onSuccess={onGoogleResponse}
                    onFailure={(e) => console.log(e)}
                    render={(renderProps) => (
                      <StyledButton onClick={renderProps.onClick} variant="destructive">
                        <StyledGoogleIcon icon={faGoogle} />
                        Login with Google
                      </StyledButton>
                    )}
                    cookiePolicy="single_host_origin"
                  />
                </ButtonContainer>

                <StyledLink to="/resetPassword" onClick={() => dispatch(resetPasswordSlice.resetState())}>
                  Forgot your password?
                </StyledLink>
              </StyledForm>
            )}
          </Formik>
        </StyledCard>
      </Container>
    </BackgroundContainer>
  );
};

export default LoginForm;
