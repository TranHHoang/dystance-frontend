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
      main: "#4ecca3"
    }
  },
  typography: {
    allVariants: {
      color: "#fff"
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
  onBulkUpdate: (changes: any[]) => Promise<void>;
  onBulkDelete: (data: any[]) => void;
}

const Table = (props: TableProps) => {
  const { title, columns, data, onRowAdd, onRowUpdate, onRowDelete, onBulkUpdate, onBulkDelete } = props;
  return (
    <StyledDiv style={{ margin: 8 }}>
      <MuiThemeProvider theme={theme}>
        <MaterialTable
          title={title}
          columns={[
            {
              title: "No",
              field: "no",
              editable: "never",
              width: 8,
              render: (row: any) => row.tableData.id + 1,
              filtering: false,
              sorting: false
            },
            ...columns
          ]}
          data={data}
          options={{
            actionsColumnIndex: -1,
            rowStyle: { color: "#fff" },
            filtering: true,
            selection: true
          }}
          onRowClick={() => console.log("A")}
          editable={{
            onRowAdd: onRowAdd,
            onRowUpdate: onRowUpdate,
            onRowDelete: onRowDelete,
            onBulkUpdate: (changes) => onBulkUpdate(_.map(changes, "newData"))
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
