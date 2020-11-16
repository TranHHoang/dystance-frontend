import { MuiThemeProvider } from "@material-ui/core";
import { theme } from "../room/invite/InviteForm";
import MaterialTable from "material-table";
import React, { useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { addStudent, deleteStudents, updateStudents } from "./student-list/StudentListSlice";
import { UserTableInfo } from "~utils/types";
import _ from "lodash";
import * as Yup from "yup";
import { addTeacher, deleteTeachers, updateTeachers } from "./teacher-list/teacherListSlice";
import moment from "moment";

const StyledDiv = styled.div`
  div::before {
    display: initial;
  }
`;

const StudentTeacherTableComponent = (props: any) => {
  const { semesterId, data, title, isStudent, isLoading } = props;
  const dispatch = useDispatch();
  return (
    <StyledDiv>
      <MuiThemeProvider theme={theme}>
        <MaterialTable
          columns={[
            {
              title: "No",
              field: "tableData",
              render: (rowData: any) => rowData.tableData.id + 1,
              filtering: false,
              width: 10,
              editable: "never"
            },
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
          isLoading={isLoading}
          options={{
            rowStyle: {
              color: "white",
              fontSize: "16px"
            },
            minBodyHeight: "70vh",
            maxBodyHeight: "70vh",
            selection: true,
            selectionProps: () => ({
              color: "primary"
            }),
            pageSize: 10,
            exportButton: true,
            filtering: true,
            actionsColumnIndex: -1
          }}
          editable={{
            onRowAdd: (newData: UserTableInfo) => {
              const format = {
                code: newData.code,
                email: newData.email,
                realName: newData.realName,
                dob: moment(newData.dob).format("YYYY-MM-DD")
              };
              console.log(format);
              console.log(_.some(format, _.isEmpty));
              console.log(!Yup.string().email().isValidSync(format.email));
              if (_.some(format, _.isEmpty) || !Yup.string().email().isValidSync(format.email)) {
                return Promise.reject();
              } else if (isStudent) {
                dispatch(addStudent(newData));
                return Promise.resolve();
              } else {
                dispatch(addTeacher(newData));
                return Promise.resolve();
              }
            },
            onRowUpdate: (newData: UserTableInfo) => {
              console.log(newData);
              console.log(_.some(newData, _.isEmpty));
              if (_.some(newData, _.isEmpty) || !Yup.string().email().isValidSync(newData.email)) {
                return Promise.reject();
              } else if (isStudent) {
                dispatch(updateStudents([newData]));
                return Promise.resolve();
              } else {
                dispatch(updateTeachers([newData]));
                return Promise.resolve();
              }
            },
            onRowDelete: (oldData: UserTableInfo) => {
              if (isStudent) {
                dispatch(deleteStudents([oldData.id]));
              } else {
                dispatch(deleteTeachers([oldData.id]));
              }
              return Promise.resolve();
            },
            onBulkUpdate: (changes) =>
              new Promise((resolve, reject) => {
                _.forEach(_.map(changes, "newData"), (change) => {
                  if (_.some(change, _.isEmpty) || !Yup.string().email().isValidSync(change.email)) {
                    reject();
                  }
                });
                if (isStudent) {
                  dispatch(updateStudents(_.map(changes, "newData")));
                  resolve();
                } else {
                  dispatch(updateTeachers(_.map(changes, "newData")));
                  resolve();
                }
              })
          }}
          actions={[
            {
              tooltip: "Delete All Selected Users",
              icon: "delete",
              onClick: (evt, data: UserTableInfo[]) => {
                if (isStudent) {
                  dispatch(deleteStudents(_.map(data, "id")));
                } else {
                  dispatch(deleteTeachers(_.map(data, "id")));
                }
              }
            }
          ]}
          title={title}
        />
      </MuiThemeProvider>
    </StyledDiv>
  );
};

export default StudentTeacherTableComponent;
