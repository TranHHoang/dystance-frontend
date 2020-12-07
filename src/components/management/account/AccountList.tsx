/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { RootState } from "~app/rootReducer";
import Table from "../Table";
import {
  Account,
  addNewAccount,
  deleteExistingAccounts,
  fetchAllAccounts,
  importExcelFile,
  resetAccountsError,
  resetAccountState,
  updateExistingAccounts
} from "./accountListSlice";
import styled from "styled-components";
import * as Yup from "yup";
import { Button, FileSelector, Notification } from "react-rainbow-components";
import moment from "moment";
import { ErrorResponse } from "~utils/types";

const Title = styled.h1`
  font-size: 2.5em;
  font-weight: 500;
  color: white;
  padding-right: 20px;
`;

const StyledNotifications = styled(Notification)`
  position: absolute;
  top: 20px;
  right: 20px;
  p {
    font-size: 16px;
    color: ${(props) => props.theme.rainbow.palette.text.main};
  }
  h1 {
    font-size: 20px;
  }
  width: 30%;
`;

const FileSelectionDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
`;

const StyledButton = styled(Button)`
  height: fit-content;
  align-self: center;
  margin-left: 20px;
  font-size: 16px;
  margin-top: 10px;
`;

export const StyledFileSelector = styled(FileSelector)`
  margin-bottom: 15px;
  height: auto;
  width: 30vw;
  label {
    font-size: 15px;
    align-self: center;
    margin-bottom: 10px;
  }
  span {
    font-size: 16px;
  }
`;

export const Container = styled.div`
  padding: 20px;
  width: 100%;
`;

const AccountList = () => {
  const accountListState = useSelector((root: RootState) => root.accountListState);
  const dispatch = useDispatch();
  const accounts = accountListState.accounts?.map((s) => ({ ...s }));
  const [rejectFile, setRejectFile] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [file, setFile] = useState<File>();

  const handleChange = (file: File) => {
    if (/(xlsx|xls)$/i.test(file?.name)) {
      if (file.size > 10 * 1024 * 1024) {
        setRejectFile(true);
        setRejectReason("File size is too large");
        setFile(undefined);
      } else {
        setRejectFile(false);
        setFile(file);
      }
    } else {
      setFile(undefined);
      setRejectFile(true);
      setRejectReason("File type not supported");
    }
  };

  useEffect(() => {
    dispatch(fetchAllAccounts());
    return () => {
      resetAccountState();
    };
  }, []);

  return (
    <>
      <div style={{ padding: "20px 0 10px 20px" }}>
        <Title>Manage Accounts</Title>
      </div>
      <Container>
        <FileSelectionDiv>
          <StyledFileSelector
            name="file"
            label="Import Accounts List"
            placeholder="Choose an Excel File"
            accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(files) => handleChange(files[0])}
            error={rejectFile ? rejectReason : null}
          />
          <StyledButton
            variant="brand"
            label="Upload File"
            onClick={() => file && dispatch(importExcelFile(file))}
            disabled={accountListState.isLoading || rejectFile}
          />
        </FileSelectionDiv>
        <Table
          title="Account List"
          data={accounts}
          columns={[
            {
              title: "Employee Code",
              field: "code",
              validate: (rowData: Account) => Yup.string().required().isValidSync(rowData.code),
              filterPlaceholder: "Employee Code"
            },
            {
              title: "Email",
              field: "email",
              validate: (rowData: Account) => Yup.string().email().required().isValidSync(rowData.email),
              filterPlaceholder: "Email"
            },
            {
              title: "Real Name",
              field: "realName",
              validate: (rowData: Account) => Yup.string().required().isValidSync(rowData.realName),
              filterPlaceholder: "Real Name"
            },
            {
              title: "DOB",
              field: "dob",
              type: "date",
              validate: (rowData: Account) => Yup.date().required().isValidSync(rowData.dob),
              filterPlaceholder: "Date Of Birth"
            },
            {
              title: "Role",
              field: "role",
              lookup: { "academic management": "Academic Management", "quality assurance": "Quality Assurance" },
              filterPlaceholder: "Role"
            }
          ]}
          onRowAdd={(newData: Account) => {
            const format = {
              code: newData.code,
              email: newData.email,
              realName: newData.realName,
              dob: moment(newData.dob).format("YYYY-MM-DD"),
              role: newData.role
            };
            console.log(format);
            if (_.some(format, _.isEmpty) || !Yup.string().email().isValidSync(format.email)) {
              return Promise.reject();
            } else {
              dispatch(resetAccountsError());
              dispatch(addNewAccount(newData));
              return Promise.resolve();
            }
          }}
          onRowUpdate={(newData: Account) => {
            const format = {
              code: newData.code,
              email: newData.email,
              realName: newData.realName,
              dob: moment(newData.dob).format("YYYY-MM-DD"),
              role: newData.role
            };
            if (_.some(format, _.isEmpty) || !Yup.string().email().isValidSync(format.email)) {
              return Promise.reject();
            } else {
              dispatch(resetAccountsError());
              dispatch(updateExistingAccounts([newData]));
              return Promise.resolve();
            }
          }}
          onRowDelete={(oldData: { id: string }) => {
            dispatch(resetAccountsError());
            dispatch(deleteExistingAccounts([oldData.id]));
            return Promise.resolve();
          }}
          onBulkUpdate={(changes: Account[]) =>
            new Promise((resolve, reject) => {
              const validated = _.every(changes, (change) => {
                const format = {
                  code: change.code,
                  email: change.email,
                  realName: change.realName,
                  dob: moment(change.dob).format("YYYY-MM-DD"),
                  role: change.role
                };
                if (_.some(format, _.isEmpty) || !Yup.string().email().isValidSync(format.email)) {
                  reject();
                  return false;
                }
                return true;
              });
              if (validated) {
                dispatch(resetAccountsError());
                dispatch(updateExistingAccounts(changes));
                resolve();
              }
            })
          }
          onBulkDelete={(data) => {
            dispatch(resetAccountsError());
            dispatch(deleteExistingAccounts(_.map(data, "id")));
          }}
        />
      </Container>
      {accountListState.errors && accountListState.errors?.length > 0 ? (
        <StyledNotifications
          title="Error"
          onRequestClose={() => dispatch(resetAccountsError())}
          description={_.map(accountListState.errors, (error: ErrorResponse) => (
            <p>{error?.message}</p>
          ))}
          icon="error"
        />
      ) : null}
    </>
  );
};

export default AccountList;
