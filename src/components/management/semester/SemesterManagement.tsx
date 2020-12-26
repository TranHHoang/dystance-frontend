/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useEffect, useState } from "react";
import { Column } from "material-table";
import { ButtonIcon, FileSelector, Notification } from "react-rainbow-components";
import {
  addNewSemester,
  deleteExistingSemesters,
  fetchAllSemesters,
  resetSemesterError,
  resetSemesterState,
  Semester,
  updateExistingSemester
} from "./semesterSlice";
import { useDispatch, useSelector } from "react-redux";
import Table from "../Table";
import _ from "lodash";
import { RootState } from "~app/rootReducer";
import SemesterDetails from "./SemesterDetails";
import styled from "styled-components";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Yup from "yup";
import moment from "moment";
import { ErrorResponse } from "~utils/index";

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

const StyledNotifications = styled(Notification)`
  position: absolute;
  top: 20px;
  z-index: 100;
  right: 20px;
  max-height: 200px;
  overflow: auto;
  width: 700px;
  p {
    font-size: 16px;
    color: ${(props) => props.theme.rainbow.palette.text.main};
  }
  h1 {
    font-size: 20px;
  }
`;

const SemesterManagement = () => {
  const semesterState = useSelector((root: RootState) => root.semesterState);
  const dispatch = useDispatch();
  const semesters = semesterState.semesters.map((s) => ({
    ...s,
    lastUpdate: moment.utc(s.lastUpdated).local().calendar()
  }));
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [rejectFile, setRejectFile] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  useEffect(() => {
    dispatch(fetchAllSemesters());
    return () => {
      dispatch(resetSemesterState());
    };
  }, []);

  const columns: Column<object>[] = [
    {
      title: "Name",
      field: "name",
      validate: (rowData: Semester) => Yup.string().required().isValidSync(rowData.name)
    },
    {
      title: "Schedule File",
      field: "file",
      editComponent: (props) => (
        <FileSelector
          value={props.value}
          onChange={(e) => {
            props.onChange(e[0]);
          }}
        />
      )
    },
    { title: "Last Updated", field: "lastUpdate", editable: "never", width: "20%" }
  ];
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
            const format = {
              name: newData.name,
              file: newData.file?.toString()
            };
            if (_.some(format, _.isEmpty)) {
              return Promise.reject();
            } else if (newData.file && newData.file instanceof File) {
              if (/(xlsx|xls)$/i.test(newData?.file.name)) {
                setRejectFile(false);
                dispatch(resetSemesterError());
                dispatch(addNewSemester(newData.name, newData.file as File));
                return Promise.resolve();
              } else {
                setRejectFile(true);
                setRejectReason("File type not supported");
                return Promise.reject();
              }
            } else {
              dispatch(resetSemesterError());
              dispatch(addNewSemester(newData.name, newData.file as File));
              return Promise.resolve();
            }
          }}
          onRowUpdate={(newData: Semester) => {
            const format = {
              name: newData.name,
              file: newData.file?.toString()
            };
            if (_.some(format, _.isEmpty)) {
              return Promise.reject();
            } else if (newData.file instanceof File) {
              if (/(xlsx|xls)$/i.test(newData?.file.name)) {
                setRejectFile(false);
                dispatch(resetSemesterError());
                dispatch(
                  updateExistingSemester({
                    id: newData.id,
                    name: newData.name,
                    file: typeof newData.file === "string" ? undefined : newData.file
                  })
                );
                return Promise.resolve();
              } else {
                setRejectFile(true);
                setRejectReason("File type not supported");
                return Promise.reject();
              }
            } else {
              dispatch(resetSemesterError());
              dispatch(
                updateExistingSemester({
                  id: newData.id,
                  name: newData.name,
                  file: typeof newData.file === "string" ? undefined : newData.file
                })
              );
              return Promise.resolve();
            }
          }}
          onRowDelete={(oldData: { id: string }) => {
            dispatch(resetSemesterError());
            dispatch(deleteExistingSemesters([oldData.id]));
            return Promise.resolve();
          }}
          onBulkDelete={(data) => {
            dispatch(resetSemesterError());
            dispatch(deleteExistingSemesters(_.map(data, "id")));
          }}
          onRowClick={(rowData) => {
            setSelectedSemesterId(rowData.id);
          }}
        />
      </div>
      {rejectFile ? (
        <StyledNotifications
          title="Error"
          onRequestClose={() => setRejectFile(false)}
          description={rejectReason}
          icon="error"
        />
      ) : null}
      {semesterState.errors && semesterState.errors?.length > 0 ? (
        <StyledNotifications
          title="Error"
          onRequestClose={() => dispatch(resetSemesterError())}
          description={_.map(semesterState.errors, (error: ErrorResponse) => (
            <p>{error?.message}</p>
          ))}
          icon="error"
        />
      ) : null}
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
