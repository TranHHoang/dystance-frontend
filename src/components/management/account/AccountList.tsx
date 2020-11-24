/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { RootState } from "~app/rootReducer";
import Table from "../Table";
import {
  Account,
  addNewAccount,
  deleteExistingAccounts,
  fetchAllAccounts,
  resetAccountsError,
  resetAccountState,
  updateExistingAccounts
} from "./accountListSlice";
import styled from "styled-components";
import * as Yup from "yup";
import { Notification } from "react-rainbow-components";

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
  }
  h1 {
    font-size: 20px;
  }
  width: 30%;
`;

const AccountList = () => {
  const accountListState = useSelector((root: RootState) => root.accountListState);
  const dispatch = useDispatch();
  const accounts = accountListState.accounts?.map((s) => ({ ...s }));

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
      <div style={{ margin: 20 }}>
        <Table
          title="Account List"
          data={accounts}
          columns={[
            {
              title: "Employee Code",
              field: "code",
              validate: (rowData: Account) => Yup.string().required().isValidSync(rowData.code)
            },
            {
              title: "Email",
              field: "email",
              validate: (rowData: Account) => Yup.string().email().required().isValidSync(rowData.email)
            },
            {
              title: "Real Name",
              field: "realName",
              validate: (rowData: Account) => Yup.string().required().isValidSync(rowData.realName)
            },
            {
              title: "Role",
              field: "role",
              lookup: { 1: "Academic Management", 2: "Quality Assurance" }
            }
          ]}
          onRowAdd={(newData: Account) => {
            const format = {
              code: newData.code,
              email: newData.email,
              realName: newData.realName,
              role: newData.role
            };
            if (_.some(format, _.isEmpty) || !Yup.string().email().isValidSync(format.email)) {
              return Promise.reject();
            } else {
              dispatch(resetAccountsError());
              dispatch(addNewAccount(newData));
              return Promise.resolve();
            }
          }}
          onRowUpdate={(newData: Account) => {
            if (_.some(newData, _.isEmpty) || !Yup.string().email().isValidSync(newData.email)) {
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
                if (_.some(change, _.isEmpty) || !Yup.string().email().isValidSync(change.email)) {
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
      </div>
      {accountListState.error ? (
        <StyledNotifications
          title="Error"
          onRequestClose={() => dispatch(resetAccountsError())}
          description={accountListState.error?.message}
          icon="error"
        />
      ) : null}
    </>
  );
};

export default AccountList;
