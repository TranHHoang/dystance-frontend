import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { AppThunk } from "~app/store";
import { get, postJson } from "~utils/axiosUtils";

export interface Account {
  id: string;
  code: string;
  realName: string;
  email: string;
  role: number;
}

const accountSlice = createSlice({
  name: "accountSlice",
  initialState: [] as Account[],
  reducers: {
    setAccounts(_, action: PayloadAction<Account[]>) {
      return action.payload;
    },
    addAccount(state, action: PayloadAction<Account>) {
      state.push(action.payload);
    },
    updateAccounts(state, action: PayloadAction<Account[]>) {
      _.each(action.payload, (account) => {
        const index = _.findIndex(state, { id: account.id });
        state.splice(index, 1, account);
      });
    },
    removeAccounts(state, action: PayloadAction<string[]>) {
      return _.reject(state, ({ id }) => action.payload.includes(id));
    }
  }
});

export default accountSlice.reducer;

const { setAccounts, addAccount, removeAccounts, updateAccounts } = accountSlice.actions;

export function fetchAllAccounts(): AppThunk {
  return async (dispatch) => {
    try {
      // const data = (await get(`/accounts`)).data;
      const data: Account[] = [
        { id: "1", code: "1", email: "SWD301@gmail.com", realName: "Test something", role: 1 },
        { id: "2", code: "1", email: "SWD301@gmail.com", realName: "Test something", role: 1 },
        { id: "3", code: "1", email: "SWD301@gmail.com", realName: "Test something", role: 1 },
        { id: "4", code: "1", email: "SWD301@gmail.com", realName: "Test something", role: 1 },
        { id: "5", code: "1", email: "SWD301@gmail.com", realName: "Test something", role: 1 }
      ];
      dispatch(setAccounts(data));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}

export function addNewAccount(account: Account): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await postJson("/accounts/add", account)).data;
      dispatch(addAccount(data));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}

export function updateExistingAccounts(accounts: Account[]): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await postJson("/accounts/update", accounts)).data;
      dispatch(updateAccounts(data));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}

export function deleteExistingAccounts(ids: string[]): AppThunk {
  return async (dispatch) => {
    try {
      await postJson("/accounts/delete", ids);
      dispatch(removeAccounts(ids));
    } catch (ex) {
      // TODO Replace with notification
      console.log(ex);
    }
  };
}
