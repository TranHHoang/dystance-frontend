import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ErrorResponse, UserTableInfo } from "~utils/types";
import _, { indexOf } from "lodash";
import * as Yup from "yup";
import moment from "moment";
import Table from "./Table";
import { addStudent, updateStudents, deleteStudents, resetStudentError } from "./student/StudentListSlice";
import { addTeacher, updateTeachers, deleteTeachers, resetTeacherError } from "./teacher/teacherListSlice";
import styled from "styled-components";
import { Notification } from "react-rainbow-components";

const StyledNotifications = styled(Notification)`
  position: absolute;
  top: 50px;
  right: 20px;
  p {
    font-size: 16px;
    color: ${(props) => props.theme.rainbow.palette.text.main};
  }
  h1 {
    font-size: 18px;
  }
  width: 30%;
`;
const StudentTeacherTableComponent = (props: any) => {
  const { data, title, isStudent, isLoading, semesterId, studentError, teacherError } = props;
  const dispatch = useDispatch();
  return (
    <>
      <Table
        isLoading={isLoading}
        columns={[
          {
            title: isStudent ? "Student Code" : "Employee Code",
            field: "code",
            validate: (rowData: UserTableInfo) => Yup.string().required().isValidSync(rowData.code),
            filterPlaceholder: isStudent ? "Student Code" : "Employee Code"
          },
          {
            title: "Email",
            field: "email",
            validate: (rowData: UserTableInfo) => Yup.string().email().required().isValidSync(rowData.email),
            filterPlaceholder: "Email"
          },
          {
            title: "Real Name",
            field: "realName",
            validate: (rowData: UserTableInfo) => Yup.string().required().isValidSync(rowData.realName),
            filterPlaceholder: "Real Name"
          },
          {
            title: "DOB",
            field: "dob",
            type: "date",
            validate: (rowData: UserTableInfo) => Yup.date().required().isValidSync(rowData.dob),
            filterPlaceholder: "Date Of Birth"
          }
        ]}
        data={data}
        onRowAdd={(newData: UserTableInfo) => {
          dispatch(resetStudentError());
          dispatch(resetTeacherError());
          const format = {
            code: newData.code,
            email: newData.email,
            realName: newData.realName,
            dob: moment(newData.dob).format("YYYY-MM-DD")
          };
          if (_.some(format, _.isEmpty) || !Yup.string().email().isValidSync(format.email)) {
            return Promise.reject();
          } else if (isStudent) {
            dispatch(addStudent(semesterId, newData));
            return Promise.resolve();
          } else {
            dispatch(addTeacher(semesterId, newData));
            return Promise.resolve();
          }
        }}
        onRowUpdate={(newData: UserTableInfo) => {
          dispatch(resetStudentError());
          dispatch(resetTeacherError());
          console.log(newData);
          console.log(_.some(newData, _.isEmpty));
          const format = {
            code: newData.code,
            email: newData.email,
            realName: newData.realName,
            dob: moment(newData.dob).format("YYYY-MM-DD")
          };
          if (_.some(format, _.isEmpty) || !Yup.string().email().isValidSync(format.email)) {
            return Promise.reject();
          } else if (isStudent) {
            dispatch(updateStudents(semesterId, [newData]));
            return Promise.resolve();
          } else {
            dispatch(updateTeachers(semesterId, [newData]));
            return Promise.resolve();
          }
        }}
        onRowDelete={(oldData: UserTableInfo) => {
          dispatch(resetTeacherError());
          dispatch(resetStudentError());
          if (isStudent) {
            dispatch(deleteStudents([oldData.id]));
          } else {
            dispatch(deleteTeachers([oldData.id]));
          }
          return Promise.resolve();
        }}
        onBulkUpdate={(changes) =>
          new Promise((resolve, reject) => {
            dispatch(resetTeacherError());
            dispatch(resetStudentError());
            _.forEach(changes, (change) => {
              const format = {
                code: change.code,
                email: change.email,
                realName: change.realName,
                dob: moment(change.dob).format("YYYY-MM-DD")
              };
              if (_.some(format, _.isEmpty) || !Yup.string().email().isValidSync(format.email)) {
                reject();
              }
            });
            if (isStudent) {
              dispatch(updateStudents(semesterId, changes));
              resolve();
            } else {
              dispatch(updateTeachers(semesterId, changes));
              resolve();
            }
          })
        }
        onBulkDelete={(data: UserTableInfo[]) => {
          dispatch(resetTeacherError());
          dispatch(resetStudentError());
          if (isStudent) {
            dispatch(deleteStudents(_.map(data, "id")));
          } else {
            dispatch(deleteTeachers(_.map(data, "id")));
          }
        }}
        title={title}
      />
      {studentError && studentError?.length > 0 ? (
        <StyledNotifications
          title="Error"
          onRequestClose={() => dispatch(resetStudentError())}
          description={_.map(studentError, (error: ErrorResponse) => (
            <p>{error?.message}</p>
          ))}
          icon="error"
        />
      ) : null}
      {teacherError && teacherError?.length > 0 ? (
        <StyledNotifications
          title="Error"
          onRequestClose={() => dispatch(resetTeacherError())}
          description={_.map(teacherError, (error: ErrorResponse) => (
            <p>{error?.message}</p>
          ))}
          icon="error"
        />
      ) : null}
    </>
  );
};

export default StudentTeacherTableComponent;
