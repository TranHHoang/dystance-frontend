import React from "react";
import { Formik, Form, Field, FormikProps } from "formik";
import * as Yup from "yup";
import { Button, CodeInput } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import { startVerifyCode } from "./resetPasswordSlice";
import { RootState } from "~app/rootReducer";
import { StyledButton } from "../login/styles";

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
    dispatch(startVerifyCode(values.accessCode));
  }

  return (
    <Formik initialValues={initialValues} validationSchema={schema} onSubmit={onSubmit}>
      {({ values, errors, touched, setFieldValue }: FormikProps<AccessCodeValues>) => (
        <Form>
          <Field
            name="accessCode"
            component={CodeInput}
            placeholder="Enter your access code"
            error={errors.accessCode && touched.accessCode ? errors.accessCode : null}
            label="Access code"
            value={values.accessCode}
            onChange={(e: any) => setFieldValue("accessCode", e)}
          />
          <Button type="submit" disabled={resetPasswordState.isLoading} label="Verify access code" />
        </Form>
      )}
    </Formik>
  );
};

export default AccessCodeForm;
