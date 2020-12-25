import { createAction } from "@reduxjs/toolkit";
import { createHashHistory } from "history";
import { socket } from "~app/App";
import { AppThunk } from "~app/store";
import { Logger } from "~utils/logger";

export const ResetStoreAction = "ResetStore";

export const resetReduxStore = createAction(ResetStoreAction);

export function signOut(): AppThunk {
  return (dispatch) => {
    localStorage.clear();
    Logger.getInstance().resetLogs();
    dispatch(resetReduxStore());
    createHashHistory().replace("/");
    socket.stop();
  };
}
