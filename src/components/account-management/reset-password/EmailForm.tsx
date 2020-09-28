import React from "react";
import { Formik, Form, Field, FormikProps } from "formik";
import { StyledInput } from "../login/styles";
import { Button } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import { startSendEmail } from "./resetPasswordSlice";
import { RootState } from "~app/rootReducer";
import * as Yup from "yup";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface EmailFormValues {
  email: string;
}

const schema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required")
});

const EmailForm = () => {
  const resetPasswordState = useSelector((state: RootState) => state.resetPasswordState);
  const dispatch = useDispatch();

  const initialValues: EmailFormValues = {
    email: resetPasswordState.email
  };

  function onSubmit(values: EmailFormValues) {
    dispatch(startSendEmail(values.email));
  }

  return (
    <Formik enableReinitialize initialValues={initialValues} validationSchema={schema} onSubmit={onSubmit}>
      {({ errors, touched }: FormikProps<EmailFormValues>) => (
        <Form>
          <Field
            name="email"
            as={StyledInput}
            placeholder="Enter your email"
            error={errors.email && touched.email ? errors.email : null}
            label="Email"
            icon={<FontAwesomeIcon icon={faEnvelope} />}
          />
          <Button type="submit" disabled={resetPasswordState.isLoading} label="Get access code" />
        </Form>
      )}
    </Formik>
  );
};

export default EmailForm;
