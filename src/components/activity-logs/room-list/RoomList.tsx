import { createMuiTheme, MuiThemeProvider } from "@material-ui/core";
import _ from "lodash";
import MaterialTable from "material-table";
import React, { useEffect, useState } from "react";
import { Picklist, Option, Button } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { allUsers } from "~utils/types";
import ActivityLogs from "../ActivityLogs";
import { getRooms, getSemesters, resetRoomListState, setSelectedRoom } from "./roomListSlice";

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
const SemesterSelectionDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
`;
const SelectSemesterText = styled.p`
  font-size: 1.75em;
  color: white;
`;
const StyledDiv = styled.div`
  div::before {
    display: initial;
  }
`;

const StyledLink = styled(Link)`
  width: 100%;
  display: flex;
  justify-content: center;
`;

export const StyledButton = styled(Button)`
  align-self: center;
  width: 100%;
  max-width: 250px;
`;
const ActionContainer = styled.div`
  display: flex;
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
const RoomList = () => {
  const roomListState = useSelector((state: RootState) => state.roomListState);
  const dispatch = useDispatch();
  const [selectedSemester, setSelectedSemester] = useState({ name: null, label: "" });
  const roomData = roomListState.rooms.map((room) => ({
    ...room,
    userName: _.find(allUsers, { id: room.teacherId }).userName
  }));

  useEffect(() => {
    dispatch(getSemesters());
    return () => {
      dispatch(resetRoomListState());
    };
  }, []);

  useEffect(() => {
    setSelectedSemester({
      name: _.last(roomListState.semesters)?.id,
      label: _.last(roomListState.semesters)?.name
    });
    setTimeout(() => {
      dispatch(getRooms(selectedSemester.name));
    }, 1000);
  }, [roomListState.semesters]);

  return !roomListState.selectedRoom ? (
    <>
      <div style={{ padding: "20px 0 10px 20px" }}>
        <Title>Timetable</Title>
      </div>
      <Container>
        <SemesterSelectionDiv>
          <SelectSemesterText>Select Semester: </SelectSemesterText>
          <Picklist
            onChange={(value) => {
              setSelectedSemester({ name: value.name, label: value.label });
              dispatch(getRooms(value.name.toString()));
            }}
            value={selectedSemester}
          >
            {_.map(roomListState.semesters, (semester) => (
              <Option key={semester.id} name={semester.id} label={semester.name} />
            ))}
          </Picklist>
        </SemesterSelectionDiv>
        <StyledDiv>
          <MuiThemeProvider theme={theme}>
            <MaterialTable
              columns={[
                {
                  title: "No",
                  field: "tableData",
                  render: (rowData: any) => rowData.tableData.id + 1,
                  filtering: false,
                  editable: "never"
                },
                {
                  title: "Room",
                  field: "roomName",
                  filterPlaceholder: "Room"
                },
                {
                  title: "Teacher",
                  field: "userName",
                  filterPlaceholder: "Teacher"
                },
                {
                  title: "Actions",
                  field: "custom",
                  editable: "never",
                  // eslint-disable-next-line react/display-name
                  render: (rowData) =>
                    rowData && (
                      <ActionContainer>
                        <StyledLink
                          style={{ textDecoration: "none" }}
                          to={{ pathname: `/room/${rowData.roomId}/${rowData.teacherId}/${rowData.roomName}` }}
                        >
                          <StyledButton label="Join Now" variant="brand" />
                        </StyledLink>
                        <StyledButton
                          label="View Class Logs"
                          onClick={() => dispatch(setSelectedRoom(rowData.roomId))}
                          variant="neutral"
                        />
                      </ActionContainer>
                    )
                }
              ]}
              data={roomData}
              isLoading={roomListState.isLoading}
              options={{
                rowStyle: {
                  color: "white",
                  fontSize: "16px"
                },
                minBodyHeight: "70vh",
                maxBodyHeight: "70vh",
                pageSize: 10,
                filtering: true,
                actionsColumnIndex: -1
              }}
              title="Rooms"
            />
          </MuiThemeProvider>
        </StyledDiv>
      </Container>
    </>
  ) : (
    <ActivityLogs />
  );
};
export default RoomList;
