/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { RootState } from "~app/rootReducer";
import Table from "../Table";
import { ButtonIcon } from "react-rainbow-components";
import { AllUsersInfo, User } from "~utils/types";
import { addNewClass, Class, deleteExistingClasses, fetchAllClasses, updateExistingClasses } from "./classListSlice";
import styled from "styled-components";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { TextField } from "@material-ui/core";

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

const StyledTextField = styled(TextField)`
  .MuiAutocomplete-input {
    padding: 0;
  }
`;

interface StudentValue {
  id: string;
  code: string;
  realName: string;
  email: string;
}

const ClassList = (props: { semesterId: string }) => {
  const { semesterId } = props;

  const classState = useSelector((root: RootState) => root.classListState);
  const [selectedClass, setSelectedClass] = useState<Class>();
  const dispatch = useDispatch();

  const allUsersInfo = JSON.parse(sessionStorage.getItem(AllUsersInfo)) as User[];
  const classes = classState.map((s) => ({ ...s, teacher: _.find(allUsersInfo, { id: s.teacher })?.userName }));

  function toSendableObj(data: Class): Class {
    return { ...data, teacher: _.find(allUsersInfo, { userName: data.teacher }).id };
  }

  useEffect(() => {
    dispatch(fetchAllClasses(semesterId));
  }, []);

  useEffect(() => {
    if (selectedClass) {
      setSelectedClass({ ...selectedClass, students: _.find(classState, { id: selectedClass.id }).students });
    }
  }, [classState]);

  return !selectedClass ? (
    <Table
      title="Classes"
      data={classes}
      columns={[
        {
          title: "Subject",
          field: "subject"
        },
        {
          title: "Class",
          field: "class"
        },
        {
          title: "Teacher",
          field: "teacher",
          editComponent: (props) => (
            <Autocomplete
              options={allUsersInfo}
              getOptionLabel={(user) => user.userName}
              onChange={(_, value: User) => props.onChange(value.id)}
              renderInput={(params) => <StyledTextField {...params} label="Teacher Code" />}
            />
          )
        }
      ]}
      onRowAdd={(newData: Class) => {
        dispatch(addNewClass(semesterId, newData));
        return Promise.resolve();
      }}
      onRowUpdate={(newData: Class) => {
        dispatch(updateExistingClasses(semesterId, [newData]));
        return Promise.resolve();
      }}
      onRowDelete={(oldData: { id: string }) => {
        dispatch(deleteExistingClasses([oldData.id]));
        return Promise.resolve();
      }}
      onBulkUpdate={(changes) => {
        dispatch(updateExistingClasses(semesterId, changes as Class[]));
        return Promise.resolve();
      }}
      onBulkDelete={(data) => dispatch(deleteExistingClasses(_.map(data, "id")))}
      onRowClick={(rowData) => setSelectedClass(rowData)}
    />
  ) : (
    <>
      <StyledHeader>
        <ButtonIcon
          icon={<FontAwesomeIcon icon={faArrowLeft} />}
          onClick={() => setSelectedClass(undefined)}
          size="medium"
        />
        <span>Back to Classes</span>
      </StyledHeader>
      <Table
        title={`Students of class ${selectedClass.subject}.${selectedClass.class}`}
        data={_.map(selectedClass.students, (studentId) => {
          const studentInfo = _.find(allUsersInfo, { id: studentId });
          return {
            id: studentId,
            code: studentInfo.userName,
            email: studentInfo.email,
            realName: studentInfo.realName
          } as StudentValue;
        })}
        columns={[
          {
            title: "Student Code",
            field: "code",
            editComponent: ({ onRowDataChange }) => {
              function onSelected(value: User) {
                if (value) {
                  const chosenStudentInfo: StudentValue = {
                    id: value.id,
                    code: value.userName,
                    realName: value.realName,
                    email: value.email
                  };
                  onRowDataChange(chosenStudentInfo);
                } else {
                  onRowDataChange({});
                }
              }

              return (
                <Autocomplete
                  options={_.reject(allUsersInfo, (user) => selectedClass.students.includes(user.id))}
                  getOptionLabel={(user) => user.userName}
                  onChange={(_, value) => onSelected(value as User)}
                  renderInput={(params) => <StyledTextField {...params} label="Student Code" />}
                />
              );
            }
          },
          {
            title: "Real Name",
            field: "realName",
            editable: "never"
          },
          {
            title: "Email",
            field: "email",
            editable: "never"
          }
        ]}
        onRowAdd={(newData: StudentValue) => {
          dispatch(
            updateExistingClasses(semesterId, [
              toSendableObj({
                ...selectedClass,
                students: _.uniq(selectedClass.students.concat(newData.id))
              })
            ])
          );
          return Promise.resolve();
        }}
        onRowDelete={(oldData: StudentValue) => {
          console.log(oldData.id);
          console.log(selectedClass);
          dispatch(
            updateExistingClasses(semesterId, [
              toSendableObj({
                ...selectedClass,
                students: _.reject(selectedClass.students, (id) => id === oldData.id)
              })
            ])
          );
          return Promise.resolve();
        }}
        onBulkDelete={(data: StudentValue[]) => {
          dispatch(
            updateExistingClasses(semesterId, [
              toSendableObj({
                ...selectedClass,
                students: _.reject(selectedClass.students, (studentId) =>
                  _.map(data, (data) => data.id).includes(studentId)
                )
              })
            ])
          );
          return Promise.resolve();
        }}
      />
    </>
  );
};

export default ClassList;
