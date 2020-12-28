import React from "react";
import MaterialTable, { Action, Column, MaterialTableProps, Options } from "material-table";
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
    type: "light",
    primary: {
      main: "#4ecca3",
      contrastText: "#fff"
    },
    background: {
      paper: "#fff"
    },
    secondary: {
      main: "#4ecca3"
    }
  },
  overrides: {
    MuiTableCell: {
      root: {
        // color: "#fff !important"
      }
    }
  }
});

export interface TableProps extends MaterialTableProps<object> {
  title?: string;
  columns: Column<object>[];
  data: any[];
  onRowClick?: (rowData: any) => void;
  isLoading?: boolean;
  actions?: Action<object>[];
  options?: Options<any>;
}

const Table = (props: TableProps) => {
  const { title, columns, data, onRowClick, isLoading, actions, options } = props;

  return (
    <StyledDiv>
      <MuiThemeProvider theme={theme}>
        <MaterialTable
          {...props}
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
              sorting: false
            },
            ...columns
          ]}
          data={data}
          options={{
            rowStyle: {
              // color: "white",
              fontSize: "18px"
            },
            minBodyHeight: "70vh",
            maxBodyHeight: "70vh",
            pageSize: 10,
            filtering: true,
            actionsColumnIndex: -1,
            ...options
          }}
          onRowClick={onRowClick && ((e, rowData) => onRowClick(rowData))}
          actions={actions}
        />
      </MuiThemeProvider>
    </StyledDiv>
  );
};

export default Table;
