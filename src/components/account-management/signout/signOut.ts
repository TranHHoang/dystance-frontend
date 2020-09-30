import { createAction } from "@reduxjs/toolkit";
import { AppThunk } from "~app/store";
import { createHashHistory } from "history";

export const ResetStoreAction = "ResetStore";

export const resetReduxStore = createAction(ResetStoreAction);

export function signOut(): AppThunk {
  return (dispatch) => {
    localStorage.clear();
    dispatch(resetReduxStore());
    createHashHistory().replace("/");
  };
}
