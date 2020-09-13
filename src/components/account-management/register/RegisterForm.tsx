import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { startRegister } from "./registerSlice";
import { RootState } from "$app/rootReducer";
import { Field, reduxForm, FormErrors } from "redux-form";

interface RegisterForm {
  userName: string;
  email: string;
  password: string;
  rePassword: string;
  realName: string;
  dob: string;
}

const initialFormState: RegisterForm = {
  userName: "test",
  email: "a@example.com",
  password: "1",
  rePassword: "1",
  realName: "a",
  dob: new Date().toDateString()
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
  } else if (new Date(values.dob).getTime() > new Date().getTime()) {
    errors.dob = "Invalid date of birth";
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
    <div>
      <h1>Register</h1>
      {registerState.error && <div>{registerState.error.message}</div>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="userName">Username:</label>
        <Field name="userName" component={requiredField} type="text" required />

        <label htmlFor="email">Email:</label>
        <Field name="email" component={requiredField} type="email" required />

        <label htmlFor="password">Password:</label>
        <Field name="password" component={requiredField} type="password" required />

        <label htmlFor="rePassword">Re-enter password:</label>
        <Field name="rePassword" component={requiredField} type="password" required />

        <label htmlFor="realName">Your name:</label>
        <Field name="realName" component={requiredField} type="text" required />

        <label htmlFor="dob">Date of birth:</label>
        <Field name="dob" component={requiredField} type="date" required />

        <button type="submit" disabled={registerState.isLoading}>
          Register
        </button>
      </form>
    </div>
  );
});

export default RegisterForm;
