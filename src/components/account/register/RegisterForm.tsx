import { faEnvelope, faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Field, Formik, FormikProps } from "formik";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { RootState } from "~app/rootReducer";
import {
  BackgroundContainer,
  ButtonContainer,
  Container,
  StyledButton,
  StyledCard,
  StyledDatePicker,
  StyledForm,
  StyledInput,
  StyledLink,
  StyledNotification,
  Title
} from "../styles";
import { startRegister } from "./registerSlice";

export interface RegisterFormValues {
  userName: string;
  email: string;
  password: string;
  rePassword: string;
  realName: string;
  dob: Date;
}

const initialValues: RegisterFormValues = {
  userName: "",
  email: "",
  password: "",
  rePassword: "",
  realName: "",
  dob: new Date()
};

const validateSchema = Yup.object({
  userName: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required").min(8, "Password must be at least 8 characters"),
  rePassword: Yup.string()
    .required("This field is required")
    .test("password match", "Re-enter password must match password", function (value) {
      const { password } = this.parent;
      return value === password;
    }),
  realName: Yup.string().required("Your name is required"),
  dob: Yup.date().required("Date of birth is required")
});

const RegisterForm = () => {
  const registerState = useSelector((state: RootState) => state.registerState);
  const dispatch = useDispatch();

  function onSubmit(values: RegisterFormValues) {
    dispatch(startRegister(values));
  }

  return (
    <BackgroundContainer>
      <Container>
        <StyledCard>
          <Title>Create Your Account</Title>
          {registerState.error && (
            <StyledNotification title={registerState.error.message} hideCloseButton={true} icon="error" />
          )}
          <Formik initialValues={initialValues} validationSchema={validateSchema} onSubmit={onSubmit}>
            {({ errors, touched, values, setFieldValue }: FormikProps<RegisterFormValues>) => (
              <StyledForm>
                <Field
                  name="userName"
                  as={StyledInput}
                  icon={<FontAwesomeIcon icon={faUser} />}
                  type="text"
                  label="Username"
                  placeholder="Enter your username"
                  error={errors.userName && touched.userName ? errors.userName : null}
                  required
                />
                <Field
                  name="email"
                  as={StyledInput}
                  icon={<FontAwesomeIcon icon={faEnvelope} />}
                  type="email"
                  label="Email"
                  placeholder="Enter your email"
                  error={errors.email && touched.email ? errors.email : null}
                  required
                />
                <Field
                  name="password"
                  as={StyledInput}
                  icon={<FontAwesomeIcon icon={faLock} />}
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
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
                <Field
                  name="realName"
                  as={StyledInput}
                  icon={<FontAwesomeIcon icon={faUser} />}
                  type="text"
                  label="Real Name"
                  placeholder="Enter your real name"
                  error={errors.realName && touched.realName ? errors.realName : null}
                  required
                />

                <StyledDatePicker
                  name="dob"
                  label="Date Of Birth"
                  locale="en-GB"
                  placeholder="Enter your date of birth"
                  value={values.dob}
                  onChange={(e) => setFieldValue("dob", e)}
                  error={errors.dob && touched.dob ? errors.dob : null}
                  required
                />

                <ButtonContainer>
                  <StyledButton variant="brand" type="submit" disabled={registerState.isLoading} label="Register" />
                  <StyledLink to="/">I already have an account</StyledLink>
                </ButtonContainer>
              </StyledForm>
            )}
          </Formik>
        </StyledCard>
      </Container>
    </BackgroundContainer>
  );
};

export default RegisterForm;
