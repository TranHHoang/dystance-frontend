import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Field, Formik, FormikProps } from "formik";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { RootState } from "~app/rootReducer";
import { ButtonContainer, StyledButton, StyledForm, StyledInput } from "../styles";
import { startChangePasword } from "./resetPasswordSlice";

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
