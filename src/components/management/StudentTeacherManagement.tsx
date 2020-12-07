import StudentList from "./student/StudentList";
import TeacherList from "./teacher/TeacherList";
import React, { useRef, useState } from "react";
import { Tabset, Tab, Button, FileSelector } from "react-rainbow-components";
import styled from "styled-components";
import { Field, Form, Formik, FormikProps } from "formik";
import { RootState } from "~app/rootReducer";
import { useDispatch, useSelector } from "react-redux";
import { uploadFile } from "./studentTeacherManagementSlice";

const Title = styled.h1`
  font-size: 2.5em;
  font-weight: 500;
  color: white;
  padding-right: 20px;
`;
export const Container = styled.div`
  padding: 20px;
  width: 100%;
`;

const StyledTab = styled(Tab)`
  button {
    font-size: 16px;
  }
`;
const FileSelectionDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
`;
const StyledForm = styled(Form)`
  width: 30vw;
  height: 90px;
`;

const StyledButton = styled(Button)`
  height: fit-content;
  align-self: center;
  margin-left: 20px;
  font-size: 16px;
`;

export const StyledFileSelector = styled(FileSelector)`
  margin-bottom: 15px;
  height: auto;
  label {
    font-size: 15px;
    align-self: center;
    margin-bottom: 10px;
  }
  span {
    font-size: 16px;
  }
`;

export interface FileUploadFormValues {
  file: File;
}
const StudentTeacherManagement = () => {
  const studentTeacherManagementState = useSelector((state: RootState) => state.studentTeacherManagementState);
  const dispatch = useDispatch();
  const [tabsetValue, setTabsetValue] = useState("students");
  const [rejectFile, setRejectFile] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const formRef = useRef(null);

  const initialValues: FileUploadFormValues = {
    file: null
  };

  const handleChange = (files: File[]) => {
    if (files[0]?.name) {
      if (/(xlsx|xls)$/i.test(files[0].name)) {
        if (files[0].size > 10 * 1024 * 1024) {
          setRejectFile(true);
          setRejectReason("File size is too large");
        } else {
          console.log("Went into true case");
          setRejectFile(false);
          const reader = new FileReader();
          const currentFile = files[0];
          if (currentFile) {
            reader.addEventListener(
              "load",
              () => {
                // setImgSrc(reader.result);
              },
              false
            );
            reader.readAsDataURL(currentFile);
          }
        }
      } else {
        console.log("Went into false case");
        setRejectFile(true);
        setRejectReason("File type not supported");
      }
    }
  };

  function getTabContent() {
    switch (tabsetValue) {
      case "students":
        return <StudentList />;
      case "teachers":
        return <TeacherList />;
    }
  }
  function onSubmit(values: FileUploadFormValues) {
    dispatch(uploadFile(values));
  }

  return (
    <>
      <div style={{ padding: "20px 0 10px 20px" }}>
        <Title>Student/Teacher Accounts</Title>
      </div>
      <Container>
        <FileSelectionDiv>
          <Formik enableReinitialize={true} initialValues={initialValues} onSubmit={onSubmit} innerRef={formRef}>
            {({ values, setFieldValue }: FormikProps<FileUploadFormValues>) => (
              <StyledForm>
                <Field
                  as={StyledFileSelector}
                  name="file"
                  label="Import Accounts List"
                  placeholder="Choose an Excel File"
                  accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(event: File[]) => {
                    handleChange(event);
                    setFieldValue("file", event[0]);
                  }}
                  error={rejectFile ? rejectReason : null}
                  value={values.file || ""}
                />
              </StyledForm>
            )}
          </Formik>
          <StyledButton
            variant="brand"
            label="Upload File"
            onClick={() => formRef?.current.handleSubmit()}
            disabled={studentTeacherManagementState.isLoading || rejectFile}
          />
        </FileSelectionDiv>
        <Tabset
          activeTabName={tabsetValue}
          onSelect={(_, selected) => {
            setTabsetValue(selected);
          }}
        >
          <StyledTab label="Students" name="students" />
          <StyledTab label="Teachers" name="teachers" />
        </Tabset>
        {getTabContent()}
      </Container>
    </>
  );
};

export default StudentTeacherManagement;
