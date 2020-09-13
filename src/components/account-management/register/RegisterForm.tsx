import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { startRegister } from "./registerSlice";
import { RootState } from "$app/rootReducer";
import { Field, reduxForm } from "redux-form";

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

const Form = reduxForm({
  form: "register-form",
  initialValues: initialFormState
})((props: any) => {
  const { handleSubmit } = props;
  const registerState = useSelector((state: RootState) => state.registerState);

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="userName">Username:</label>
        <Field name="userName" component="input" type="text" required />

        <label htmlFor="email">Email:</label>
        <Field name="email" component="input" type="email" required />

        <label htmlFor="password">Password:</label>
        <Field name="password" component="input" type="password" required />

        <label htmlFor="rePassword">Re-enter password:</label>
        <Field name="rePassword" component="input" type="password" required />

        <label htmlFor="realName">Your name:</label>
        <Field name="realName" component="input" type="text" required />

        <label htmlFor="dob">Date of birth:</label>
        <Field name="dob" component="input" type="date" required />

        <button type="submit" disabled={registerState.isLoading}>
          Register
        </button>

        {registerState.error && <div>{registerState.error.message}</div>}
      </form>
    </div>
  );
});

export const RegisterForm = () => {
  const dispatch = useDispatch();

  function onSubmit(values: RegisterForm) {
    dispatch(startRegister(values.email, values.userName, values.password, values.realName, values.dob));
  }

  return <Form onSubmit={onSubmit} />;
};
