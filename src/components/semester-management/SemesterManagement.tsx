/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useEffect, useState } from "react";
import { Column } from "material-table";
import { ButtonIcon, FileSelector } from "react-rainbow-components";
import {
  addNewSemester,
  deleteExistingSemesters,
  fetchAllSemesters,
  Semester,
  updateExistingSemesters
} from "./semesterSlice";
import { useDispatch, useSelector } from "react-redux";
import Table from "./Table";
import _ from "lodash";
import { RootState } from "~app/rootReducer";
import SemesterDetails from "./SemesterDetails";
import styled from "styled-components";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Title = styled.h1`
  font-size: 2.5em;
  font-weight: 500;
  color: white;
  padding-right: 20px;
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

const columns: Column<object>[] = [
  { title: "Name", field: "name" },
  {
    title: "Schedule File",
    field: "file",
    editComponent: (props) => <FileSelector value={props.value} onChange={(e) => props.onChange(e.item(0))} />
  },
  { title: "Last Updated", field: "lastUpdated", editable: "never", width: "20%" }
];

const SemesterManagement = () => {
  const semesterState = useSelector((root: RootState) => root.semesterState);
  const dispatch = useDispatch();
  const semesters = semesterState.map((s) => ({ ...s }));
  const [selectedSemesterId, setSelectedSemesterId] = useState("");

  useEffect(() => {
    dispatch(fetchAllSemesters());
  }, []);

  return !selectedSemesterId ? (
    <>
      <div style={{ padding: "20px 0 10px 20px" }}>
        <Title>Your semesters</Title>
      </div>
      <div style={{ margin: 20 }}>
        <Table
          title="Semester"
          columns={columns}
          data={semesters}
          onRowAdd={(newData: Semester) => {
            dispatch(addNewSemester(newData.name, newData.file as File));
            return Promise.resolve();
          }}
          onRowUpdate={(newData: Semester) => {
            dispatch(
              updateExistingSemesters([
                {
                  id: newData.id,
                  name: newData.name,
                  file: typeof newData.file === "string" ? undefined : newData.file
                }
              ])
            );
            return Promise.resolve();
          }}
          onRowDelete={(oldData: { id: string }) => {
            dispatch(deleteExistingSemesters([oldData.id]));
            return Promise.resolve();
          }}
          onBulkUpdate={(changes) => {
            dispatch(updateExistingSemesters(changes as Semester[]));
            return Promise.resolve();
          }}
          onBulkDelete={(data) => dispatch(deleteExistingSemesters(_.map(data, "id")))}
          onRowClick={(rowData) => {
            setSelectedSemesterId(rowData.id);
            console.log(rowData);
          }}
        />
      </div>
    </>
  ) : (
    <>
      <StyledHeader>
        <ButtonIcon
          icon={<FontAwesomeIcon icon={faArrowLeft} />}
          onClick={() => setSelectedSemesterId("")}
          size="medium"
        />
        <span>Back to Your Semesters</span>
      </StyledHeader>
      <SemesterDetails semesterId={selectedSemesterId} />
    </>
  );
};

export default SemesterManagement;
