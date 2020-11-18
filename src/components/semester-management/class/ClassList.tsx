/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useEffect, useState } from "react";
import { Column } from "material-table";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { RootState } from "~app/rootReducer";
import Table from "../Table";
import { Lookup } from "react-rainbow-components";
import { LookupValue } from "react-rainbow-components/components/types";
import { AllUsersInfo, User } from "~utils/types";
import { getLoginData } from "~utils/tokenStorage";
import { addNewClass, Class, deleteExistingClasses, fetchAllClasses, updateExistingClasses } from "./classListSlice";

const columns: Column<object>[] = [
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
    field: "teacher"
  }
];

interface ClassValue {
  id: string;
  subject: string;
  class: string;
  teacher: string;
}

interface StudentValue {
  id: string;
  code: string;
  realName: string;
  email: string;
}

const ClassList = (props: { semesterId: string }) => {
  const { semesterId } = props;

  const classState = useSelector((root: RootState) => root.classListState);
  const dispatch = useDispatch();

  const allUsersInfo = JSON.parse(sessionStorage.getItem(AllUsersInfo)) as User[];
  const classes = classState.map((s) => ({ ...s, teacher: _.find(allUsersInfo, { id: s.teacher })?.userName }));

  const [autoCompleteOptions, setAutoCompleteOptions] = useState([]);

  const options: LookupValue[] = allUsersInfo.map((userInfo) => ({
    id: userInfo.id,
    label: `${userInfo.realName} (${userInfo.userName})`
  }));

  function filter(query: string, options: LookupValue[]) {
    if (query) {
      return options.filter((item) => {
        const regex = new RegExp(query, "i");
        return regex.test(item.label.toString()) && item.id !== getLoginData().id;
      });
    }
    return [];
  }

  function toSendableObj(data: Class): Class {
    return { ...data, teacher: _.find(allUsersInfo, { userName: data.teacher }).id };
  }

  useEffect(() => {
    dispatch(fetchAllClasses(semesterId));
  }, []);

  return (
    <Table
      title="Classes"
      data={classes}
      columns={columns}
      onRowAdd={(newData: Class) => {
        dispatch(addNewClass(semesterId, toSendableObj(newData)));
        return Promise.resolve();
      }}
      onRowUpdate={(newData: Class) => {
        dispatch(updateExistingClasses(semesterId, [toSendableObj(newData)]));
        return Promise.resolve();
      }}
      onRowDelete={(oldData: { id: string }) => {
        dispatch(deleteExistingClasses([oldData.id]));
        return Promise.resolve();
      }}
      onBulkUpdate={(changes) => {
        dispatch(updateExistingClasses(semesterId, _.map(changes as Class[], toSendableObj)));
        return Promise.resolve();
      }}
      onBulkDelete={(data) => dispatch(deleteExistingClasses(_.map(data, "id")))}
      detailPanel={(rowData: Class) => {
        return (
          <Table
            style={{ marginLeft: 50 }}
            title={`Students of class ${rowData.subject}.${rowData.class}`}
            data={_.map(rowData.students, (studentId) => {
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
                editComponent: ({ onRowDataChange, ...props }) => {
                  function onChange(value: LookupValue) {
                    console.log(value);
                    const studentInfo = _.find(allUsersInfo, { id: value.id });
                    const chosenStudentInfo: StudentValue = {
                      id: value.id,
                      code: value.label.toString(),
                      realName: studentInfo.realName,
                      email: studentInfo.email
                    };
                    console.log(chosenStudentInfo);
                    onRowDataChange(chosenStudentInfo);
                  }

                  return (
                    <Lookup
                      {...props}
                      onChange={onChange}
                      options={autoCompleteOptions}
                      onSearch={(value) => setAutoCompleteOptions(filter(value, options))}
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
                    ...rowData,
                    students: rowData.students.concat(newData.id)
                  })
                ])
              );
              return Promise.resolve();
            }}
            onRowDelete={(oldData: StudentValue) => {
              console.log(oldData.id);
              console.log(rowData);
              dispatch(
                updateExistingClasses(semesterId, [
                  toSendableObj({
                    ...rowData,
                    students: _.reject(rowData.students, (id) => id === oldData.id)
                  })
                ])
              );
              return Promise.resolve();
            }}
            onBulkDelete={(data: StudentValue[]) => {
              dispatch(
                updateExistingClasses(semesterId, [
                  toSendableObj({
                    ...rowData,
                    students: _.reject(rowData.students, (studentId) =>
                      _.map(data, (data) => data.id).includes(studentId)
                    )
                  })
                ])
              );
              return Promise.resolve();
            }}
          />
        );
      }}
    />
  );
};

export default ClassList;
