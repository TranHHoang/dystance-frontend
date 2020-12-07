import React from "react";
import { useDispatch } from "react-redux";
import { ErrorResponse, User } from "~utils/index";
import _ from "lodash";
import * as Yup from "yup";
import moment from "moment";
import { addStudent, updateStudents, deleteStudents, resetStudentError } from "./student/StudentListSlice";
import { addTeacher, updateTeachers, deleteTeachers, resetTeacherError } from "./teacher/teacherListSlice";
import styled from "styled-components";
import { Notification } from "react-rainbow-components";
import Table from "./Table";

export interface UserTableInfo extends User {
  code: string;
}

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
  const { data, title, isStudent, isLoading, studentError, teacherError } = props;
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
          const format = {
            code: newData.code,
            email: newData.email,
            realName: newData.realName,
            dob: moment(newData.dob).format("YYYY-MM-DD")
          };
          if (_.some(format, _.isEmpty) || !Yup.string().email().isValidSync(format.email)) {
            return Promise.reject();
          } else if (isStudent) {
            dispatch(resetStudentError());
            dispatch(addStudent(newData));
            return Promise.resolve();
          } else {
            dispatch(resetTeacherError());
            dispatch(addTeacher(newData));
            return Promise.resolve();
          }
        }}
        onRowUpdate={(newData: UserTableInfo) => {
          const format = {
            code: newData.code,
            email: newData.email,
            realName: newData.realName,
            dob: moment(newData.dob).format("YYYY-MM-DD")
          };
          if (_.some(format, _.isEmpty) || !Yup.string().email().isValidSync(format.email)) {
            return Promise.reject();
          } else if (isStudent) {
            dispatch(resetStudentError());
            dispatch(updateStudents([newData]));
            return Promise.resolve();
          } else {
            dispatch(resetTeacherError());
            dispatch(updateTeachers([newData]));
            return Promise.resolve();
          }
        }}
        onRowDelete={(oldData: UserTableInfo) => {
          if (isStudent) {
            dispatch(resetStudentError());
            dispatch(deleteStudents([oldData.id]));
          } else {
            dispatch(resetTeacherError());
            dispatch(deleteTeachers([oldData.id]));
          }
          return Promise.resolve();
        }}
        onBulkUpdate={(changes) =>
          new Promise((resolve, reject) => {
            const validated = _.every(changes, (change) => {
              const format = {
                code: change.code,
                email: change.email,
                realName: change.realName,
                dob: moment(change.dob).format("YYYY-MM-DD")
              };
              if (_.some(format, _.isEmpty) || !Yup.string().email().isValidSync(format.email)) {
                reject();
                return false;
              }
              return true;
            });
            if (validated) {
              if (isStudent) {
                dispatch(resetStudentError());
                dispatch(updateStudents(changes));
                resolve();
              } else {
                dispatch(resetTeacherError());
                dispatch(updateTeachers(changes));
                resolve();
              }
            }
          })
        }
        onBulkDelete={(data: UserTableInfo[]) => {
          if (isStudent) {
            dispatch(resetStudentError());
            dispatch(deleteStudents(_.map(data, "id")));
          } else {
            dispatch(resetTeacherError());
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
