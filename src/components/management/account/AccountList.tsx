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
  updateExistingAccounts
} from "./accountListSlice";
import styled from "styled-components";

const Title = styled.h1`
  font-size: 2.5em;
  font-weight: 500;
  color: white;
  padding-right: 20px;
`;

const AccountList = () => {
  const accountListState = useSelector((root: RootState) => root.accountListState);
  const dispatch = useDispatch();
  const accounts = accountListState.map((s) => ({ ...s }));

  useEffect(() => {
    dispatch(fetchAllAccounts());
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
              field: "code"
            },
            {
              title: "Email",
              field: "email"
            },
            {
              title: "Real Name",
              field: "realName"
            },
            {
              title: "Role",
              field: "role",
              lookup: { 1: "Academic Management", 2: "Quality Assurance" }
            }
          ]}
          onRowAdd={(newData: Account) => {
            dispatch(addNewAccount(newData));
            return Promise.resolve();
          }}
          onRowUpdate={(newData: Account) => {
            dispatch(updateExistingAccounts([newData]));
            return Promise.resolve();
          }}
          onRowDelete={(oldData: { id: string }) => {
            dispatch(deleteExistingAccounts([oldData.id]));
            return Promise.resolve();
          }}
          onBulkUpdate={(changes: Account[]) => {
            dispatch(updateExistingAccounts(changes));
            return Promise.resolve();
          }}
          onBulkDelete={(data) => dispatch(deleteExistingAccounts(_.map(data, "id")))}
        />
      </div>
    </>
  );
};

export default AccountList;
