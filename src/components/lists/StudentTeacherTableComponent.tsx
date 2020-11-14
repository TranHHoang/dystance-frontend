import { MuiThemeProvider } from "@material-ui/core";
import { theme } from "../room/invite/InviteForm";
import MaterialTable from "material-table";
import * as React from "react";
import styled from "styled-components";

const StyledDiv = styled.div`
  div::before {
    display: initial;
  }
`;

const StudentTeacherTableComponent = (props: any) => {
  const { data, title } = props;
  return (
    <StyledDiv>
      <MuiThemeProvider theme={theme}>
        <MaterialTable
          columns={[
            {
              title: "No",
              field: "tableData",
              render: (rowData) => rowData.tableData.id + 1,
              filtering: false,
              width: 10,
              editable: "never"
            },
            { title: "Email", field: "email" },
            { title: "Real Name", field: "realName" },
            { title: "DOB", field: "dob", type: "date" }
          ]}
          data={data}
          options={{
            rowStyle: {
              color: "white",
              fontSize: "16px"
            },
            minBodyHeight: "70vh",
            maxBodyHeight: "70vh",

            pageSize: 10,
            exportButton: true,
            filtering: true,
            actionsColumnIndex: -1
          }}
          editable={{
            onRowAdd: (newData) => {
              console.log(newData);
              return Promise.resolve();
            },
            onRowUpdate: (newData, oldData) =>
              new Promise((resolve) => {
                console.log("New Data:", newData);
                console.log("Old Data:", oldData);
                resolve();
              }),
            onRowDelete: (oldData) =>
              new Promise((resolve) => {
                console.log(oldData);
                resolve();
              })
          }}
          title={title}
        />
      </MuiThemeProvider>
    </StyledDiv>
  );
};

export default StudentTeacherTableComponent;
