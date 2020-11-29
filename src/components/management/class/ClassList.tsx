/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useEffect, useState } from "react";
import { Column } from "material-table";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { RootState } from "~app/rootReducer";
import Table from "../Table";
import { ButtonIcon, Notification } from "react-rainbow-components";
import { AllUsersInfo, User } from "~utils/types";
import {
  addNewClass,
  Class,
  deleteExistingClasses,
  fetchAllClasses,
  resetClassError,
  resetClassState,
  updateExistingClasses
} from "./classListSlice";
import styled from "styled-components";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { TextField } from "@material-ui/core";
import * as Yup from "yup";

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

const StyledNotifications = styled(Notification)`
  position: absolute;
  top: 50px;
  right: 20px;
  p {
    font-size: 16px;
  }
  h1 {
    font-size: 20px;
  }
  width: 30%;
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
  const teachers = _.filter(allUsersInfo, { role: "teacher" });
  const students = _.filter(allUsersInfo, { role: "student" });
  const classes = classState.classes?.map((s) => ({
    ...s,
    teacher: _.find(allUsersInfo, { id: s.teacher })?.userName
  }));

  function toSendableObj(data: Class): Class {
    return { ...data, teacher: _.find(allUsersInfo, { userName: data.teacher })?.id };
  }

  useEffect(() => {
    dispatch(fetchAllClasses(semesterId));
    return () => {
      dispatch(resetClassState());
    };
  }, []);

  useEffect(() => {
    if (selectedClass) {
      setSelectedClass({ ...selectedClass, students: _.find(classState.classes, { id: selectedClass.id }).students });
    }
  }, [classState.classes]);

  return !selectedClass ? (
    <>
      <Table
        title="Classes"
        data={classes}
        columns={[
          {
            title: "Subject",
            field: "subject",
            validate: (rowData: Class) => Yup.string().required().isValidSync(rowData.subject)
          },
          {
            title: "Class",
            field: "class",
            validate: (rowData: Class) => Yup.string().required().isValidSync(rowData.class)
          },
          {
            title: "Teacher",
            field: "teacher",
            editComponent: (props) => (
              <Autocomplete
                options={teachers}
                getOptionLabel={(user: User) => user.userName}
                onChange={(_, value: User) => props.onChange(value?.userName)}
                renderInput={(params) => <StyledTextField {...params} label="Teacher Code" />}
              />
            )
          }
        ]}
        onRowAdd={(newData: Class) => {
          const format = {
            subject: newData.subject,
            class: newData.class,
            teacher: newData.teacher
          };
          if (_.some(format, _.isEmpty)) {
            return Promise.reject();
          } else {
            dispatch(resetClassError());
            dispatch(addNewClass(semesterId, toSendableObj({ ...newData, students: [] })));
            return Promise.resolve();
          }
        }}
        onRowUpdate={(newData: Class) => {
          if (_.some(_.omit(newData, "students"), _.isEmpty)) {
            return Promise.reject();
          } else {
            dispatch(resetClassError());
            dispatch(updateExistingClasses(semesterId, [toSendableObj(newData)]));
            return Promise.resolve();
          }
        }}
        onRowDelete={(oldData: { id: string }) => {
          dispatch(resetClassError());
          dispatch(deleteExistingClasses([oldData.id]));
          return Promise.resolve();
        }}
        onBulkUpdate={(changes: Class[]) =>
          new Promise((resolve, reject) => {
            if (_.some(changes, (change) => _.some(_.omit(change, "students"), _.isEmpty))) {
              reject();
            } else {
              dispatch(resetClassError());
              dispatch(updateExistingClasses(semesterId, _.map(changes, toSendableObj)));
              resolve();
            }
          })
        }
        onBulkDelete={(data) => {
          dispatch(resetClassError());
          dispatch(deleteExistingClasses(_.map(data, "id")));
        }}
        onRowClick={(rowData) => setSelectedClass(rowData)}
      />
      {classState.error ? (
        <StyledNotifications
          title="Error"
          onRequestClose={() => dispatch(resetClassError())}
          description={classState.error?.message}
          icon="error"
        />
      ) : null}
    </>
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
            code: studentInfo?.userName,
            email: studentInfo?.email,
            realName: studentInfo?.realName
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
                  options={_.reject(students, (user: User) => selectedClass.students.includes(user.id))}
                  getOptionLabel={(user: User) => user?.userName}
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
          console.log(newData);
          const format = {
            code: newData.code,
            realName: newData.realName,
            email: newData.email
          };
          if (_.some(format, _.isEmpty)) {
            return Promise.reject();
          } else {
            dispatch(
              updateExistingClasses(semesterId, [
                toSendableObj({
                  ...selectedClass,
                  students: _.uniq(selectedClass.students.concat(newData.id))
                })
              ])
            );
            return Promise.resolve();
          }
        }}
        onRowDelete={(oldData: StudentValue) => {
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
