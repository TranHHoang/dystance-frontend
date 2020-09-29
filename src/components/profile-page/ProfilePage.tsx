import * as React from "react";
import { useState, useEffect, useRef } from "react";
import {
  StyledButton,
  Container,
  ImageContainer,
  StyledCard,
  StyledImage,
  Title,
  CardContainer,
  StyledInput,
  StyledDatePicker,
  StyledFileSelector,
  StyledForm,
  DisabledInput
} from "./profilePageStyles";
import { Formik, Field, FormikProps, FormikHelpers, FormikValues } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import { showProfile } from "./showProfileInfoSlice";
import { updateProfile, changePasswordStart, cancelChangePassword } from "./updateProfileSlice";
import { Button } from "react-rainbow-components";

export interface UpdateProfileFormValues {
  realName: string;
  userName: string;
  email: string;
  dob: Date;
  password: string;
  newPassword: string;
  newAvatar: File;
}

const validationSchema = Yup.object({
  userName: Yup.string().required("Username is required"),
  dob: Yup.date().required("Date of birth is required"),
  password: Yup.string().test("required if new password filled in", "This field is required", function (value) {
    const { newPassword } = this.parent;
    console.log(newPassword === undefined);
    if (newPassword) {
      return value !== undefined;
    }
    return true;
  }),
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .test("password differ", "New password must not match old password", function (value) {
      const { password } = this.parent;
      if (password) {
        return value !== password;
      }
      return true;
    })
});
const ProfilePage = () => {
  const showProfileState = useSelector((state: RootState) => state.showProfileState);
  const updateProfileState = useSelector((state: RootState) => state.updateProfileState);
  const [imgSrc, setImgSrc] = useState(null);
  const [rejectFile, setRejectFile] = useState(false);
  const formRef = useRef(null);
  const dispatch = useDispatch();

  const initialValues: UpdateProfileFormValues = {
    realName: showProfileState.user?.realName,
    userName: showProfileState.user?.userName,
    email: showProfileState.user?.email,
    dob: new Date(showProfileState.user?.dob),
    password: "",
    newPassword: "",
    newAvatar: null
  };

  //Handle avatar change and display on avatar container
  const handleChange = (files: File[]) => {
    if (files[0]?.name) {
      if (/(jpg|png|jpeg)$/i.test(files[0].name)) {
        setRejectFile(false);
        const reader = new FileReader();
        const currentFile = files[0];
        if (currentFile) {
          reader.addEventListener(
            "load",
            () => {
              setImgSrc(reader.result);
            },
            false
          );
          reader.readAsDataURL(currentFile);
        }
      } else {
        setRejectFile(true);
      }
    }
  };

  useEffect(() => {
    dispatch(showProfile());
  }, []);

  function onSubmit(values: UpdateProfileFormValues) {
    dispatch(updateProfile(values));
  }
  function reset() {
    formRef?.current.resetForm();
    setImgSrc(null);
    dispatch(cancelChangePassword());
  }
  return (
    <Container>
      <Title>My Account</Title>
      <StyledCard
        footer={
          <div className="rainbow-flex rainbow-justify_end">
            <Button
              className="rainbow-m-right_large"
              label="Cancel"
              variant="neutral"
              onClick={() => reset()}
              disabled={updateProfileState.isLoading}
            />
            <Button
              label="Save"
              variant="brand"
              type="submit"
              onClick={() => {
                console.log(formRef.current);
                formRef?.current.handleSubmit();
              }}
              disabled={updateProfileState.isLoading}
            />
          </div>
        }
      >
        <CardContainer>
          <ImageContainer>
            <StyledImage src={!imgSrc ? showProfileState.user?.avatar : imgSrc} alt="" />
          </ImageContainer>
          <Formik
            enableReinitialize={true}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            innerRef={formRef}
          >
            {({ errors, touched, values, setFieldValue }: FormikProps<UpdateProfileFormValues>) => (
              <StyledForm>
                <Field name="email" as={DisabledInput} type="email" label="Email" value={values.email || ""} readOnly />
                <Field
                  name="userName"
                  as={DisabledInput}
                  type="text"
                  label="Username"
                  value={values.userName || ""}
                  readOnly
                />
                <Field
                  as={StyledFileSelector}
                  name="newAvatar"
                  label="Change Avatar"
                  placeholder="Drag and drop or select a file"
                  accept="image/png, image/jpeg"
                  onChange={(event: File[]) => {
                    handleChange(event);
                    setFieldValue("newAvatar", event[0]);
                  }}
                  error={rejectFile ? "File is not supported" : null}
                  value={values.newAvatar || ""}
                />
                <Field
                  name="realName"
                  as={StyledInput}
                  type="text"
                  label="Real Name"
                  error={errors.realName && touched.realName ? errors.realName : null}
                />
                <StyledDatePicker
                  name="dob"
                  label="Date Of Birth"
                  locale="en-GB"
                  value={values.dob || ""}
                  onChange={(e) => setFieldValue("dob", e)}
                  error={errors.dob && touched.dob ? errors.dob : null}
                  required
                />
                {!updateProfileState.changePassword ? (
                  <StyledButton
                    variant="base"
                    label="Change Password?"
                    onClick={() => dispatch(changePasswordStart())}
                  />
                ) : null}
                {updateProfileState.changePassword ? (
                  <div>
                    <Field
                      name="password"
                      as={StyledInput}
                      type="password"
                      label="Current Password"
                      error={
                        updateProfileState.error && updateProfileState.error.type === 0
                          ? updateProfileState.error.message
                          : errors.password && touched.password
                          ? errors.password
                          : null
                      }
                    />
                    <Field
                      name="newPassword"
                      as={StyledInput}
                      type="password"
                      label="New Password"
                      error={errors.newPassword && touched.newPassword ? errors.newPassword : null}
                    />
                  </div>
                ) : null}
              </StyledForm>
            )}
          </Formik>
        </CardContainer>
      </StyledCard>
    </Container>
  );
};
export default ProfilePage;
