import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import _ from "lodash";
import fs from "fs";
import moment from "moment";
import { AppThunk } from "~app/store";
import { get, post, ErrorResponse, fetchAllUsers } from "~utils/index";

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
    dispatch(setLoadingState(true));
    try {
      const form = new FormData();
      form.append("file", file);

      const data = (await post("/admin/accounts/import", form)).data;
      dispatch(setLoadingState(false));
      if (data.failed.length > 0) {
        dispatch(setAccountsError(data.failed));
        const errors: ErrorResponse[] = _.map(data.failed, "message");
        if (errors.length > 5) {
          const folderName = `./errors/qa-am-accounts`;
          if (!fs.existsSync(folderName)) {
            fs.mkdirSync(folderName, { recursive: true });
          }
          fs.writeFile(`./errors/qa-am-accounts/${moment().format("YYYY-MM-DD")}.txt`, errors.join("\n"), (err) => {
            if (err) {
              console.log(err);
            }
          });
        }
      }
      dispatch(fetchAllAccounts());
      await fetchAllUsers();
    } catch (e) {
      const ex = e as AxiosError;
      dispatch(setLoadingState(false));
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
      const data = (await post("/admin/accounts/add", account)).data;
      dispatch(addAccount(data));
      await fetchAllUsers();
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
      const data = (await post("/admin/accounts/update", accounts)).data;
      if (data.success.length > 0) {
        dispatch(updateAccounts(data.success));
        await fetchAllUsers();
      }
      if (data.failed.length > 0) {
        dispatch(setAccountsError(data.failed));
        const errors: ErrorResponse[] = _.map(data.failed, "message");
        if (errors.length > 5) {
          const folderName = `./errors/qa-am-accounts`;
          if (!fs.existsSync(folderName)) {
            fs.mkdirSync(folderName, { recursive: true });
          }
          fs.writeFile(`./errors/qa-am-accounts/${moment().format("YYYY-MM-DD")}.txt`, errors.join("\n"), (err) => {
            if (err) {
              console.log(err);
            }
          });
        }
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
      await post("/admin/accounts/delete", ids);
      dispatch(removeAccounts(ids));
      await fetchAllUsers();
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
