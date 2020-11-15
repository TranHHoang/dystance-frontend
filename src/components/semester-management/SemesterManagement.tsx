/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useEffect } from "react";
import MaterialTable, { Column } from "material-table";
import { FileSelector } from "react-rainbow-components";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core";
import { addNewSemester, deleteExistingSemester, fetchAllSemesters, updateExistingSemester } from "./semesterSlice";
import { useDispatch } from "react-redux";
import styled from "styled-components";

const StyledDiv = styled.div`
  div::before {
    display: initial;
  }
`;

const columns: Column<object>[] = [
  {
    title: "No",
    field: "no",
    editable: "never",
    width: 8,
    render: (row: any) => row.tableData.id + 1,
    filtering: false,
    sorting: false
  },
  { title: "Name", field: "name" },
  {
    title: "Schedule File",
    field: "file",
    editComponent: (props) => <FileSelector value={props.value} onChange={(e) => props.onChange(e.item(0))} />
  },
  { title: "Last Updated", field: "lastUpdated", editable: "never", width: "20%" }
];

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#4ecca3"
    }
  },
  typography: {
    allVariants: {
      color: "#fff"
    }
  }
});

const data = [
  { id: 1, name: "Test", lastUpdated: "02/02/2020 at 13:20", file: "1234" },
  { id: 1, name: "Test2", lastUpdated: "02/02/2020 at 13:20", file: "1234" },
  { id: 1, name: "Test3", lastUpdated: "02/02/2020 at 13:20", file: "1234" },
  { id: 1, name: "Test4", lastUpdated: "02/02/2020 at 13:20", file: "1234" },
  { id: 1, name: "Test5", lastUpdated: "02/02/2020 at 13:20", file: "1234" },
  { id: 1, name: "Test6", lastUpdated: "02/02/2020 at 13:20", file: "1234" }
];

const SemesterManagement = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllSemesters());
  }, []);

  return (
    <StyledDiv style={{ margin: 8 }}>
      <MuiThemeProvider theme={theme}>
        <MaterialTable
          title="Semesters"
          columns={columns}
          data={data}
          options={{
            actionsColumnIndex: -1,
            rowStyle: { color: "#fff" },
            filtering: true
          }}
          onRowClick={() => console.log("A")}
          editable={{
            onRowAdd: (newData: { name: string; file: File }) => {
              dispatch(addNewSemester(newData.name, newData.file));
              return Promise.resolve();
            },
            onRowUpdate: (oldData, newData: { id: string; name: string; file: string | File }) => {
              dispatch(
                updateExistingSemester(
                  newData.id,
                  newData.name,
                  typeof newData.file === "string" ? undefined : newData.file
                )
              );
              return Promise.resolve();
            },
            onRowDelete: (oldData: { id: string }) => {
              dispatch(deleteExistingSemester(oldData.id));
              return Promise.resolve();
            }
          }}
        />
      </MuiThemeProvider>
    </StyledDiv>
  );
};

export default SemesterManagement;
