import React from "react";
import { Link } from "react-router-dom";
import GoogleLogin, { GoogleLoginResponse } from "react-google-login";
import config from "./googleConfigs.json";
import { useDispatch, useSelector } from "react-redux";
import { startLogin, LoginError, resendEmail } from "./loginSlice";
import { RootState } from "$app/rootReducer";
import { Field, reduxForm, FormErrors } from "redux-form";

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
        <span>
          <button onClick={onResendEmail}>Click here</button>
          to resend email
        </span>
      );
    } else if (loginState.resendEmailLoading) {
      resendEmailSection = <span>Sending...</span>;
    } else if (!loginState.resendEmailLoading && !loginState.resendEmailError) {
      console.log(loginState);

      resendEmailSection = (
        <span>
          <span>Resend email successful! Does not work?</span>
          <button onClick={onResendEmail}>Click here to try again</button>
        </span>
      );
    } else {
      resendEmailSection = <span>{loginState.resendEmailError}</span>;
    }
  }

  return (
    <div>
      <h1>Sign In</h1>
      {resendEmailSection}

      {loginState.error && <div color="red">{loginState.error && loginState.error.message}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="emailOrUserName">Email/User name:</label>
        <Field name="emailOrUserName" component={requiredField} type="text" required />

        <br />

        <label htmlFor="password">Password:</label>
        <Field name="password" component={requiredField} type="password" required />

        <br />

        <Link to="/register">Create a new account</Link>

        <button type="submit" disabled={loginState.isLoading}>
          Sign In
        </button>
      </form>
      <GoogleLogin
        clientId={config.GoogleClientId}
        onSuccess={onGoogleResponse}
        onFailure={(e) => console.log(e)}
        render={(renderProps) => <button onClick={renderProps.onClick}>Login with Google</button>}
        cookiePolicy="single_host_origin"
      />
    </div>
  );
});

export default LoginForm;
