import React from "react";
import MaterialTable, { Column } from "material-table";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core";
import styled from "styled-components";
import _ from "lodash";

const StyledDiv = styled.div`
  div::before {
    display: initial;
  }
`;

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#4ecca3",
      contrastText: "#36393f"
    },
    background: {
      paper: "#36393f"
    },
    secondary: {
      main: "#4ecca3"
    }
  },
  overrides: {
    MuiInputBase: {
      root: {
        height: "2em"
      }
    }
  }
});

export interface TableProps {
  title: string;
  columns: Column<object>[];
  data: any[];
  onRowClick?: (rowData: any) => void;
  onRowAdd: (newData: any) => Promise<void>;
  onRowUpdate: (newData: any) => Promise<void>;
  onRowDelete: (oldData: any) => Promise<void>;
  onBulkUpdate?: (changes: any[]) => Promise<void>;
  onBulkDelete: (data: any[]) => void;
  isLoading?: boolean;
}

const Table = (props: TableProps) => {
  const {
    title,
    columns,
    data,
    onRowAdd,
    onRowUpdate,
    onRowDelete,
    onBulkUpdate,
    onBulkDelete,
    onRowClick,
    isLoading
  } = props;

  return (
    <StyledDiv>
      <MuiThemeProvider theme={theme}>
        <MaterialTable
          title={title}
          isLoading={isLoading}
          columns={[
            {
              title: "No",
              field: "no",
              editable: "never",
              width: 8,
              render: (row: any) => row.tableData.id + 1,
              filtering: false,
              sorting: false,
              export: false
            },
            ...columns
          ]}
          data={data}
          options={{
            rowStyle: {
              color: "white",
              fontSize: "16px"
            },
            minBodyHeight: "68vh",
            maxBodyHeight: "68vh",
            selection: true,
            selectionProps: () => ({
              color: "primary"
            }),
            pageSize: 10,
            filtering: true,
            actionsColumnIndex: -1
          }}
          onRowClick={(e, rowData) => onRowClick(rowData)}
          editable={{
            onRowAdd: onRowAdd,
            onRowUpdate: onRowUpdate,
            onRowDelete: onRowDelete,
            onBulkUpdate: onBulkUpdate && ((changes) => onBulkUpdate(_.map(changes, "newData")))
          }}
          actions={[
            {
              icon: "delete",
              tooltip: "Delete all selected choice",
              onClick: (e, data: any[]) => onBulkDelete(data)
            }
          ]}
        />
      </MuiThemeProvider>
    </StyledDiv>
  );
};

export default Table;
