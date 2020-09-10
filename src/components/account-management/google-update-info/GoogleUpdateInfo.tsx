import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "$app/rootReducer";
import { Field, reduxForm, FormErrors } from "redux-form";
import { startGoogleUpdateInfo } from "./googleUpdateInfoSlice";

interface GoogleUpdateInfoForm {
  userName: string;
  realName: string;
  dob: string;
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

const requiredField = ({ input, label, type, meta: { touched, error } }: any) => (
  <div>
    <label>{label}</label>
    <div>
      <input {...input} placeholder={label} type={type} />
      {touched && error && <span>{error}</span>}
    </div>
  </div>
);

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
    <div>
      <h1>Update User Info</h1>

      {updateInfoState.error && <div color="red">{updateInfoState.error && updateInfoState.error.message}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="userName">User name:</label>
        <Field name="userName" component={requiredField} type="text" required />

        <br />

        <label htmlFor="realName">Real name:</label>
        <Field name="realName" component={requiredField} type="text" required />

        <label htmlFor="dob">Date of birth:</label>
        <Field name="dob" component={requiredField} type="date" required />

        <br />

        <button type="submit" disabled={updateInfoState.isLoading}>
          Update
        </button>
      </form>
    </div>
  );
});

export default GoogleUpdateInfoForm;
