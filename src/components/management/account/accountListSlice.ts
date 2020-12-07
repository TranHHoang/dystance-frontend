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
  dob: string;
  role: number;
}
interface AccountState {
  isLoading: boolean;
  accounts: Account[];
  errors?: ErrorResponse[];
}

const initialState: AccountState = {
  isLoading: false,
  accounts: [],
  errors: []
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
      state.errors = state.errors.concat(action.payload);
    },
    resetAccountsError(state) {
      state.errors = [];
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
      const data = (await get(`/admin/accounts`)).data;
      console.log(data);
      dispatch(setAccounts(data));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(setAccountsError(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          setAccountsError({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          setAccountsError({
            message: ex.message,
            type: 4
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
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(setAccountsError(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          setAccountsError({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          setAccountsError({
            message: ex.message,
            type: 4
          })
        );
      }
    }
    setLoadingState(false);
  };
}

export function addNewAccount(account: Account): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await postJson("/admin/accounts/add", account)).data;
      dispatch(addAccount(data));
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(setAccountsError(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          setAccountsError({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          setAccountsError({
            message: ex.message,
            type: 4
          })
        );
      }
    }
  };
}

export function updateExistingAccounts(accounts: Account[]): AppThunk {
  return async (dispatch) => {
    try {
      const data = (await postJson("/admin/accounts/update", accounts)).data;
      if (data.success.length > 0) {
        dispatch(updateAccounts(data.success));
      }
      if (data.failed.length > 0) {
        _.forEach(data.failed, (error: ErrorResponse) => {
          console.log(error);
          dispatch(setAccountsError(error));
        });
        dispatch(fetchAllAccounts());
      }
    } catch (e) {
      const ex = e as AxiosError;

      if (ex.response?.data) {
        dispatch(setAccountsError(e.response.data as ErrorResponse));
      } else if (ex.request) {
        dispatch(
          setAccountsError({
            message: "Something Went Wrong",
            type: 3
          })
        );
      } else {
        dispatch(
          setAccountsError({
            message: ex.message,
            type: 4
          })
        );
      }
    }
  };
}

export function deleteExistingAccounts(ids: string[]): AppThunk {
  return async (dispatch) => {
    try {
      await postJson("/admin/accounts/delete", ids);
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
