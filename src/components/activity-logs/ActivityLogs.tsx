import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core";
import _ from "lodash";
import MaterialTable from "material-table";
import moment from "moment";
import React, { useEffect } from "react";
import { Button, ButtonIcon, Notification } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { AllUsersInfo, User } from "~utils/index";
import { getActivityLogs, resetActivityLogState, resetLogError } from "./activityLogsSlice";
import { setSelectedRoom } from "./room-list/roomListSlice";

const Title = styled.h1`
  font-size: 2.5em;
  font-weight: 500;
  color: white;
  padding-right: 20px;
`;

const Container = styled.div`
  padding: 20px;
  width: 100%;
`;

const StyledDiv = styled.div`
  div::before {
    display: initial;
  }
`;

export const StyledButton = styled(Button)`
  align-self: center;
  width: 100%;
  max-width: 250px;
`;

const StyledHeader = styled.header`
  background-color: ${(props) => props.theme.rainbow.palette.background.main};
  z-index: 1;
  display: flex;
  padding: 5 0 5 0;
  span {
    align-self: center;
    font-size: 16px;
    color: white;
  }
`;

const StyledNotifications = styled(Notification)`
  position: absolute;
  top: 20px;
  right: 20px;
  p {
    font-size: 16px;
  }
  h1 {
    font-size: 20px;
  }
  width: 30%;
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
    },
    MuiTableCell: {
      root: {
        color: "#fff !important"
      }
    }
  }
});
const ActivityLogs = () => {
  const activityLogState = useSelector((state: RootState) => state.activityLogState);
  const roomListState = useSelector((state: RootState) => state.roomListState);
  const allUsers = JSON.parse(sessionStorage.getItem(AllUsersInfo)) as User[];
  const dispatch = useDispatch();
  const logData = activityLogState.logs.map((log) => ({
    date: moment(log.dateTime).format("YYYY-MM-DD"),
    time: moment(log.dateTime).format("HH:mm"),
    user: _.find(allUsers, { id: log.userId })?.userName,
    ...log
  }));

  useEffect(() => {
    dispatch(getActivityLogs(roomListState.selectedRoom));
    return () => {
      dispatch(resetActivityLogState());
    };
  }, []);

  return (
    <>
      <div style={{ padding: "20px 0 10px 20px" }}>
        <Title>Class Logs</Title>
      </div>
      <Container>
        <StyledHeader>
          <ButtonIcon
            icon={<FontAwesomeIcon icon={faArrowLeft} />}
            onClick={() => dispatch(setSelectedRoom(""))}
            size="medium"
          />
          <span>Back to All Rooms</span>
        </StyledHeader>
        <StyledDiv>
          <MuiThemeProvider theme={theme}>
            <MaterialTable
              columns={[
                {
                  title: "No",
                  field: "tableData",
                  render: (rowData: any) => rowData.tableData.id + 1,
                  filtering: false,
                  width: "fit-content",
                  editable: "never",
                  export: false
                },
                {
                  title: "Date",
                  field: "date",
                  type: "date",
                  filterPlaceholder: "Date"
                },
                {
                  title: "Time",
                  field: "time",
                  type: "time",
                  filterPlaceholder: "Time"
                },
                {
                  title: "Log Type",
                  field: "logType",
                  filterPlaceholder: "Log Type"
                },
                {
                  title: "User",
                  field: "user",
                  filterPlaceholder: "User"
                },
                {
                  title: "Description",
                  field: "description",
                  filterPlaceholder: "Description"
                }
              ]}
              data={logData}
              isLoading={activityLogState.isLoading}
              options={{
                rowStyle: {
                  color: "white",
                  fontSize: "16px"
                },
                minBodyHeight: "70vh",
                maxBodyHeight: "70vh",
                pageSize: 10,
                filtering: true,
                actionsColumnIndex: -1,
                exportButton: true,
                exportAllData: true
              }}
              title={_.find(roomListState.rooms, { roomId: roomListState.selectedRoom })?.roomName}
            />
          </MuiThemeProvider>
        </StyledDiv>
      </Container>
      {activityLogState.error ? (
        <StyledNotifications
          title="Error"
          onRequestClose={() => dispatch(resetLogError())}
          description={activityLogState.error?.message}
          icon="error"
        />
      ) : null}
    </>
  );
};
export default ActivityLogs;
