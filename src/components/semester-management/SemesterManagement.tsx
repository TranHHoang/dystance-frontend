/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useEffect } from "react";
import { Column } from "material-table";
import { FileSelector } from "react-rainbow-components";
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
import { data } from "jquery";
import { RootState } from "~app/rootReducer";

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

  useEffect(() => {
    dispatch(fetchAllSemesters());
  }, []);

  return (
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
    />
  );
};

export default SemesterManagement;
