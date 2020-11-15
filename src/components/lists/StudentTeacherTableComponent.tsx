import { MuiThemeProvider } from "@material-ui/core";
import { theme } from "../room/invite/InviteForm";
import MaterialTable from "material-table";
import * as React from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { addStudent, deleteStudents, updateStudent } from "./student-list/StudentListSlice";
import { UserTableInfo } from "~utils/types";
import _ from "lodash";
import * as Yup from "yup";
import { addTeacher, deleteTeachers, updateTeacher } from "./teacher-list/teacherListSlice";

const StyledDiv = styled.div`
  div::before {
    display: initial;
  }
`;

const StudentTeacherTableComponent = (props: any) => {
  const { semesterId, data, title, isStudent } = props;
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
              title: "Email",
              field: "email",
              validate: (rowData: UserTableInfo) => Yup.string().email().required().isValidSync(rowData.email)
            },
            {
              title: "Real Name",
              field: "realName",
              validate: (rowData: UserTableInfo) => Yup.string().required().isValidSync(rowData.realName)
            },
            { title: "DOB", field: "dob", type: "date", validate: (rowData: UserTableInfo) => rowData.dob !== "" }
          ]}
          data={data}
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
              if (isStudent) {
                dispatch(addStudent(newData));
              } else {
                dispatch(addTeacher(newData));
              }
              return Promise.resolve();
            },
            onRowUpdate: (newData, _) => {
              if (isStudent) {
                dispatch(updateStudent(newData));
              } else {
                dispatch(updateTeacher(newData));
              }
              return Promise.resolve();
            },
            onRowDelete: (oldData: UserTableInfo) => {
              if (isStudent) {
                dispatch(deleteStudents([oldData.id]));
              } else {
                dispatch(deleteTeachers([oldData.id]));
              }
              return Promise.resolve();
            }
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
