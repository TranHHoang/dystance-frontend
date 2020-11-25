import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import _ from "lodash";
import { AppThunk } from "~app/store";
import { get, postForm, postJson } from "~utils/axiosUtils";
import { ErrorResponse } from "~utils/types";

export interface Account {
  id: string;
  code: string;
  realName: string;
  email: string;
  role: number;
}
interface AccountState {
  isLoading: boolean;
  accounts: Account[];
  error?: ErrorResponse;
}

const initialState: AccountState = {
  isLoading: false,
  accounts: []
};

const accountSlice = createSlice({
  name: "accountSlice",
  initialState,
  reducers: {
    setLoadingState(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setAccounts(state, action: PayloadAction<Account[]>) {
      state.accounts = action.payload;
    },
    addAccount(state, action: PayloadAction<Account>) {
      state.accounts.push(action.payload);
    },
    updateAccounts(state, action: PayloadAction<Account[]>) {
      _.each(action.payload, (account) => {
        const index = _.findIndex(state.accounts, { id: account.id });
        state.accounts.splice(index, 1, account);
      });
    },
    removeAccounts(state, action: PayloadAction<string[]>) {
      state.accounts = _.reject(state.accounts, ({ id }) => action.payload.includes(id));
    },
    setAccountsError(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    },
    resetAccountsError(state) {
      state.error = undefined;
    },
    resetAccountState() {
      return initialState;
    }
  }
});

export default accountSlice.reducer;

export const {
  setAccounts,
  addAccount,
  removeAccounts,
  updateAccounts,
  resetAccountState,
  setAccountsError,
  resetAccountsError,
  setLoadingState
} = accountSlice.actions;

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
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(setAccountsError(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          setAccountsError({
            message: "Something Went Wrong",
            type: 1
          })
        );
      } else {
        dispatch(
          setAccountsError({
            message: ex.message,
            type: 2
          })
        );
      }
    }
  };
}

export function importExcelFile(file: File): AppThunk {
  return async (dispatch) => {
    setLoadingState(true);
    try {
      const form = new FormData();
      form.append("file", file);

      await postForm("/admin/accounts/import", form);
      dispatch(fetchAllAccounts());
    } catch (ex) {
      setAccountsError(ex.data);
    }
    setLoadingState(false);
  };
}

export function addNewAccount(account: Account): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await postJson("/accounts/add", account)).data;
      dispatch(addAccount(data));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(setAccountsError(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          setAccountsError({
            message: "Something Went Wrong",
            type: 1
          })
        );
      } else {
        dispatch(
          setAccountsError({
            message: ex.message,
            type: 2
          })
        );
      }
    }
  };
}

export function updateExistingAccounts(accounts: Account[]): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await postJson("/accounts/update", accounts)).data;
      dispatch(updateAccounts(data));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(setAccountsError(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          setAccountsError({
            message: "Something Went Wrong",
            type: 1
          })
        );
      } else {
        dispatch(
          setAccountsError({
            message: ex.message,
            type: 2
          })
        );
      }
    }
  };
}

export function deleteExistingAccounts(ids: string[]): AppThunk {
  return async (dispatch) => {
    try {
      await postJson("/accounts/delete", ids);
      dispatch(removeAccounts(ids));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(setAccountsError(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          setAccountsError({
            message: "Something Went Wrong",
            type: 1
          })
        );
      } else {
        dispatch(
          setAccountsError({
            message: ex.message,
            type: 2
          })
        );
      }
    }
  };
}
