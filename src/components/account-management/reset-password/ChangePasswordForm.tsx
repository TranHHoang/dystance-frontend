import React from "react";
import { Formik, Form, Field, FormikProps } from "formik";
import * as Yup from "yup";
import { Button } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import { startChangePasword } from "./resetPasswordSlice";
import { RootState } from "~app/rootReducer";
import { StyledInput, StyledForm, StyledButton, ButtonContainer } from "../login/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";

interface ChangePasswordValues {
  password: string;
  rePassword: string;
}

const initialValues: ChangePasswordValues = {
  password: "",
  rePassword: ""
};

const schema = Yup.object({
  password: Yup.string().required("Password is required").min(8, "Password must be at least 8 characters"),
  rePassword: Yup.string()
    .required("Re-enter Password is required")
    .oneOf([Yup.ref("password"), null], "Re-enter password must match")
});

const ChangePasswordForm = () => {
  const resetPasswordState = useSelector((state: RootState) => state.resetPasswordState);
  const dispatch = useDispatch();

  function onSubmit(values: ChangePasswordValues) {
    dispatch(startChangePasword(resetPasswordState.email, values.password));
  }

  return (
    <Formik initialValues={initialValues} validationSchema={schema} onSubmit={onSubmit}>
      {({ errors, touched }: FormikProps<ChangePasswordValues>) => (
        <StyledForm>
          <Field
            name="password"
            as={StyledInput}
            icon={<FontAwesomeIcon icon={faLock} />}
            type="password"
            label="New Password"
            placeholder="Enter your new password"
            error={errors.password && touched.password ? errors.password : null}
            required
          />
          <Field
            name="rePassword"
            as={StyledInput}
            icon={<FontAwesomeIcon icon={faLock} />}
            type="password"
            label="Re-enter Password"
            placeholder="Re-enter your password"
            error={errors.rePassword && touched.rePassword ? errors.rePassword : null}
            required
          />
          <ButtonContainer>
            <StyledButton variant="brand" type="submit" disabled={resetPasswordState.isLoading} label="Confirm" />
          </ButtonContainer>
        </StyledForm>
      )}
    </Formik>
  );
};

export default ChangePasswordForm;
