import { createAction } from "@reduxjs/toolkit";
import { createHashHistory } from "history";
import { AppThunk } from "~app/store";

export const ResetStoreAction = "ResetStore";

export const resetReduxStore = createAction(ResetStoreAction);

export function signOut(): AppThunk {
  return (dispatch) => {
    localStorage.clear();
    dispatch(resetReduxStore());
    createHashHistory().replace("/");
  };
}
