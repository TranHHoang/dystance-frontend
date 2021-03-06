import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Field, Formik, FormikProps } from "formik";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { RootState } from "~app/rootReducer";
import { ButtonContainer, StyledButton, StyledForm, StyledInput, StyledLink, StyledReturnLink } from "../styles";
import { startSendEmail } from "./resetPasswordSlice";

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
        <StyledForm>
          <Field
            name="email"
            as={StyledInput}
            placeholder="Enter your email"
            error={errors.email && touched.email ? errors.email : null}
            label="Enter your email to reset password"
            icon={<FontAwesomeIcon icon={faEnvelope} />}
          />
          <ButtonContainer>
            <StyledButton
              variant="brand"
              type="submit"
              disabled={resetPasswordState.isLoading}
              label="Get access code"
            />
            <StyledReturnLink to="/">
              <StyledButton style={{ width: "100%" }} variant="neutral" type="submit" label="Return to Login Page" />
            </StyledReturnLink>
          </ButtonContainer>
        </StyledForm>
      )}
    </Formik>
  );
};

export default EmailForm;
