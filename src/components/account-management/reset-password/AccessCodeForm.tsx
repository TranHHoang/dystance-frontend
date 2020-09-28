import React from "react";
import { Formik, Form, FormikProps } from "formik";
import * as Yup from "yup";
import { Button, CodeInput } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import { resendAccessCode, startVerifyCode } from "./resetPasswordSlice";
import { RootState } from "~app/rootReducer";
import { ResetPasswordError } from "./resetPasswordSlice";

interface AccessCodeValues {
  accessCode: string;
}

const initialValues: AccessCodeValues = {
  accessCode: ""
};

const schema = Yup.object({
  accessCode: Yup.string().required("Access code is required")
});

const AccessCodeForm = () => {
  const resetPasswordState = useSelector((state: RootState) => state.resetPasswordState);
  const dispatch = useDispatch();

  function onSubmit(values: AccessCodeValues) {
    dispatch(startVerifyCode(resetPasswordState.email, values.accessCode));
  }

  return (
    <Formik initialValues={initialValues} validationSchema={schema} onSubmit={onSubmit}>
      {({ values, errors, touched, setFieldValue }: FormikProps<AccessCodeValues>) => (
        <Form>
          {resetPasswordState.error && resetPasswordState.error.type === ResetPasswordError.WrongOrExpiredToken && (
            <Button
              label="Resend access code"
              onClick={() => dispatch(resendAccessCode())}
              disabled={resetPasswordState.isLoading}
            />
          )}

          <CodeInput
            value={values.accessCode}
            onChange={(e: any) => setFieldValue("accessCode", e)}
            error={errors.accessCode && touched.accessCode ? errors.accessCode : null}
            length={6}
            label="Access code"
          />
          <Button type="submit" disabled={resetPasswordState.isLoading} label="Verify access code" />
        </Form>
      )}
    </Formik>
  );
};

export default AccessCodeForm;
